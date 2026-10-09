import React, { useEffect, useState, useCallback } from 'react';
import type { Course, HealthCheckResponse, Resource } from '../api/types';
import { checkHealth, apiClientStatus, getCourseById } from '../api';
import { AppContext } from './contextDefinition';
import type { ActiveResourceViewer } from './contextDefinition';

const RECENT_COURSES_KEY = 'nexus_recent_courses';
const RECENT_RESOURCES_KEY = 'nexus_recent_resources';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isBackendLive, setIsBackendLive] = useState<boolean | null>(null);
  const [isMockForced, setIsMockForced] = useState<boolean>(apiClientStatus.isMockOnly());

  const [viewerState, setViewerState] = useState<ActiveResourceViewer>({
    isOpen: false,
    resource: null,
  });

  const [recentCourses, setRecentCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_COURSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentResources, setRecentResources] = useState<Resource[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_RESOURCES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshHealth = useCallback(async () => {
    try {
      const result = await checkHealth();
      setHealth(result);
      setIsBackendLive(apiClientStatus.isLive());
    } catch {
      setIsBackendLive(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    async function syncHealth() {
      try {
        const result = await checkHealth();
        if (!isCancelled) {
          setHealth(result);
          setIsBackendLive(apiClientStatus.isLive());
        }
      } catch {
        if (!isCancelled) {
          setIsBackendLive(false);
        }
      }
    }

    syncHealth();
    const interval = setInterval(syncHealth, 15000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const toggleForceMock = useCallback(() => {
    const nextState = !isMockForced;
    apiClientStatus.setForceMock(nextState);
    setIsMockForced(nextState);
    refreshHealth();
  }, [isMockForced, refreshHealth]);

  const recordCourseAccess = useCallback((course: Course) => {
    setRecentCourses((prev) => {
      const filtered = prev.filter((c) => c.id !== course.id);
      const updated = [course, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_COURSES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  const recordResourceAccess = useCallback((resource: Resource) => {
    setRecentResources((prev) => {
      const filtered = prev.filter((r) => r.id !== resource.id);
      const updated = [resource, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(RECENT_RESOURCES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }, []);

  const openResourceViewer = useCallback((resource: Resource, targetPage?: number) => {
    recordResourceAccess(resource);
    // Also track parent course if available
    if (resource.course_id) {
      getCourseById(resource.course_id)
        .then((course) => recordCourseAccess(course))
        .catch(() => {});
    }
    setViewerState({
      isOpen: true,
      resource,
      targetPage,
    });
  }, [recordResourceAccess, recordCourseAccess]);

  const closeResourceViewer = useCallback(() => {
    setViewerState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        health,
        isBackendLive,
        isMockForced,
        toggleForceMock,
        refreshHealth,
        viewerState,
        openResourceViewer,
        closeResourceViewer,
        recentCourses,
        recordCourseAccess,
        recentResources,
        recordResourceAccess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
