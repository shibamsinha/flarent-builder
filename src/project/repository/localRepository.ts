import type { Project, ProjectSummary } from '@/types/project';
import { STORE_PROJECTS, storage } from '@/project/persistence/idb';
import { migrateProject } from '@/project/migrations';
import type { ProjectRepository } from './types';

interface StoredProject {
  id: string;
  updatedAt: number;
  /** Serialised project. Stored as a string so a corrupt record can never
   *  break the whole object store. */
  data: string;
}

export class LocalProjectRepository implements ProjectRepository {
  async create(project: Project): Promise<void> {
    await this.update(project);
  }

  async update(project: Project): Promise<void> {
    const record: StoredProject = {
      id: project.id,
      updatedAt: project.updatedAt,
      data: JSON.stringify(project),
    };
    await storage.put(STORE_PROJECTS, record);
  }

  async get(id: string): Promise<Project | null> {
    const record = await storage.get<StoredProject>(STORE_PROJECTS, id);
    if (!record) return null;
    try {
      return migrateProject(JSON.parse(record.data));
    } catch (error) {
      console.error('[flarent] could not read project', id, error);
      throw new ProjectReadError(id, error);
    }
  }

  async delete(id: string): Promise<void> {
    await storage.delete(STORE_PROJECTS, id);
  }

  async list(): Promise<ProjectSummary[]> {
    const records = await storage.getAll<StoredProject>(STORE_PROJECTS);
    const summaries: ProjectSummary[] = [];
    for (const record of records) {
      try {
        const project = JSON.parse(record.data) as Project;
        summaries.push({
          id: project.id,
          name: project.name,
          updatedAt: project.updatedAt,
          createdAt: project.createdAt,
          pageCount: project.pages?.length ?? 0,
          templateId: project.templateId,
        });
      } catch {
        // A single unreadable project must not hide the rest of the dashboard.
        summaries.push({
          id: record.id,
          name: 'Damaged project',
          updatedAt: record.updatedAt ?? 0,
          createdAt: record.updatedAt ?? 0,
          pageCount: 0,
        });
      }
    }
    return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export class ProjectReadError extends Error {
  constructor(
    public readonly projectId: string,
    public readonly cause: unknown,
  ) {
    super('This project could not be opened because its data is damaged.');
    this.name = 'ProjectReadError';
  }
}
