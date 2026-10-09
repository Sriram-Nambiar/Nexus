import { getDatabase } from '../db/database';
import { Course, Resource, ResourceResponse, SearchResult } from '../types';

export interface ContentSearchProvider {
  search(query: string, limit?: number): Promise<Array<{
    resource_id: string;
    course_id: string;
    title: string;
    snippet: string;
    relevance_score?: number;
  }>>;
}

export class SearchService {
  private static contentSearchProvider: ContentSearchProvider | null = null;

  /**
   * Registers an optional content search provider (e.g. from the AI Python service)
   * to allow deep document-content searching without conflicting with metadata search.
   */
  public static registerContentSearchProvider(provider: ContentSearchProvider): void {
    this.contentSearchProvider = provider;
  }

  public static async search(query: string, includeContent = false): Promise<SearchResult> {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        query: '',
        total: 0,
        courses: [],
        resources: [],
        content_search_enabled: this.contentSearchProvider !== null,
      };
    }

    const db = getDatabase();
    const term = `%${trimmed}%`;

    // 1. Search Courses Metadata (title, description, instructor)
    const coursesStmt = db.prepare(`
      SELECT * FROM courses
      WHERE title LIKE ? OR description LIKE ? OR instructor LIKE ?
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1 
          ELSE 2 
        END, 
        created_at DESC
      LIMIT 20
    `);
    const courses = coursesStmt.all(term, term, term, `${trimmed}%`) as Course[];

    // 2. Search Resources Metadata (title, description, resource_type)
    const resourcesStmt = db.prepare(`
      SELECT * FROM resources
      WHERE title LIKE ? OR description LIKE ? OR resource_type LIKE ?
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1 
          ELSE 2 
        END, 
        created_at DESC
      LIMIT 30
    `);
    const rawResources = resourcesStmt.all(term, term, term, `${trimmed}%`) as Resource[];

    const resources: ResourceResponse[] = rawResources.map((res) => ({
      ...res,
      file_url: `/api/resources/${res.id}/file`,
      download_url: `/api/resources/${res.id}/file?download=1`,
    }));

    // 3. Document-content search coordination with AI service
    let contentResults: SearchResult['content_results'] | undefined = undefined;
    if (includeContent && this.contentSearchProvider) {
      try {
        contentResults = await this.contentSearchProvider.search(trimmed, 10);
      } catch (err) {
        console.warn('AI document-content search failed or timed out:', err);
      }
    }

    const total = courses.length + resources.length + (contentResults ? contentResults.length : 0);

    return {
      query: trimmed,
      total,
      courses,
      resources,
      content_search_enabled: this.contentSearchProvider !== null,
      ...(contentResults ? { content_results: contentResults } : {}),
    };
  }
}
