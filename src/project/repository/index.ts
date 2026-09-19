import { LocalProjectRepository } from './localRepository';
import type { ProjectRepository } from './types';

let repository: ProjectRepository = new LocalProjectRepository();

export function getProjectRepository(): ProjectRepository {
  return repository;
}

/** Swap the implementation: used by tests today, by Flarent Cloud later. */
export function setProjectRepository(next: ProjectRepository): void {
  repository = next;
}

export type { ProjectRepository };
export { ProjectReadError } from './localRepository';
