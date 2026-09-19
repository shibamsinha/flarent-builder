import type { Project, ProjectSummary } from '@/types/project';

/**
 * Persistence boundary. The editor only ever talks to this interface, so the
 * local IndexedDB implementation can be replaced by a hosted API without the
 * editor knowing.
 */
export interface ProjectRepository {
  create(project: Project): Promise<void>;
  get(id: string): Promise<Project | null>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<ProjectSummary[]>;
}
