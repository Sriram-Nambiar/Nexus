
import os
import re
import sqlite3
from pathlib import Path
from typing import Any


DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "nexus.db"
DB_PATH = Path(os.getenv("NEXUS_DB_PATH", str(DEFAULT_DB_PATH)))


def get_connection(db_path: str | Path | None = None) -> sqlite3.Connection:
    """Open the local database and ensure its schema exists."""
    path = Path(db_path) if db_path is not None else DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(path), timeout=10)
    conn.row_factory = sqlite3.Row

    try:
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
                resource_id UNINDEXED,
                course_id UNINDEXED,
                resource_title,
                page UNINDEXED,
                chunk_index UNINDEXED,
                text,
                tokenize='unicode61'
            )
        """)
        conn.commit()
        return conn
    except Exception:
        conn.close()
        raise


def index_chunks(
    chunks: list[dict[str, Any]],
    resource_id: str,
    db_path: str | Path | None = None,
) -> int:
    """
    Replace the indexed chunks for one resource.

    Re-indexing the same resource won't create duplicate entries.
    """
    conn = get_connection(db_path)

    try:
        with conn:
            conn.execute(
                "DELETE FROM chunks_fts WHERE resource_id = ?",
                (resource_id,),
            )

            for chunk in chunks:
                if chunk["resource_id"] != resource_id:
                    raise ValueError(
                        "Every chunk must match the resource being indexed"
                    )

                conn.execute(
                    """
                    INSERT INTO chunks_fts (
                        resource_id, course_id, resource_title,
                        page, chunk_index, text
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        chunk["resource_id"],
                        chunk["course_id"],
                        chunk["resource_title"],
                        chunk["page"],
                        chunk["chunk_index"],
                        chunk["text"],
                    ),
                )

        return len(chunks)
    finally:
        conn.close()


def delete_resource(
    resource_id: str,
    db_path: str | Path | None = None,
) -> int:
    """Remove all indexed chunks for a resource."""
    conn = get_connection(db_path)

    try:
        with conn:
            cursor = conn.execute(
                "DELETE FROM chunks_fts WHERE resource_id = ?",
                (resource_id,),
            )
            return cursor.rowcount
    finally:
        conn.close()


def search_chunks(
    query: str,
    course_id: str | None = None,
    limit: int = 5,
    db_path: str | Path | None = None,
) -> list[dict[str, Any]]:
    """Search local indexed text and return source metadata."""
    if limit < 1 or limit > 50:
        raise ValueError("limit must be between 1 and 50")

    # Convert ordinary questions into safe FTS5 search terms.
    terms = re.findall(r"\w+", query, flags=re.UNICODE)
    if not terms:
        return []

    fts_query = " OR ".join(f'"{term}"' for term in terms)
    conn = get_connection(db_path)

    try:
        sql = """
            SELECT
                resource_id,
                course_id,
                resource_title,
                page,
                chunk_index,
                text,
                snippet(chunks_fts, 5, '[', ']', '...', 18) AS snippet
            FROM chunks_fts
            WHERE chunks_fts MATCH ?
        """
        params: list[Any] = [fts_query]

        if course_id:
            sql += " AND course_id = ?"
            params.append(course_id)

        sql += " ORDER BY rank LIMIT ?"
        params.append(limit)

        rows = conn.execute(sql, params).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
