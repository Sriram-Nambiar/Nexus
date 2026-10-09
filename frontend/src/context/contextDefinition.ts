import { createContext } from 'react';
import type { Course, HealthCheckResponse, Resource } from '../api/types';

export interface ActiveResourceViewer {
  isOpen: boolean;
  resource: Resource | null;
  targetPage?: number;
}

export interface AppContextType {
  health: HealthCheckResponse | null;
  isBackendLive: boolean | null;
  isMockForced: boolean;
  toggleForceMock: () => void;
  refreshHealth: () => Promise<void>;
  
  // Resource Viewer Modal
  viewerState: ActiveResourceViewer;
  openResourceViewer: (resource: Resource, targetPage?: number) => void;
  closeResourceViewer: () => void;
  
  // Recent Courses & Resources
  recentCourses: Course[];
  recordCourseAccess: (course: Course) => void;
  recentResources: Resource[];
  recordResourceAccess: (resource: Resource) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
