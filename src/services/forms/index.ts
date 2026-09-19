import { STORE_SUBMISSIONS, storage } from '@/project/persistence/idb';
import { uid } from '@/utils/id';

export interface FormSubmission {
  formId: string;
  data: Record<string, string>;
  submittedAt: number;
}

export interface StoredSubmission extends FormSubmission {
  id: string;
}

/**
 * Where a contact-form submission goes. V1 keeps them locally; a hosted inbox
 * implements the same two methods.
 */
export interface FormService {
  submit(submission: FormSubmission): Promise<void>;
  list(formId?: string): Promise<StoredSubmission[]>;
}

export class LocalFormService implements FormService {
  async submit(submission: FormSubmission): Promise<void> {
    const record: StoredSubmission = { ...submission, id: uid('sub') };
    await storage.put(STORE_SUBMISSIONS, record);
  }

  async list(formId?: string): Promise<StoredSubmission[]> {
    const all = await storage.getAll<StoredSubmission>(STORE_SUBMISSIONS);
    return all
      .filter((item) => !formId || item.formId === formId)
      .sort((a, b) => b.submittedAt - a.submittedAt);
  }
}

let service: FormService = new LocalFormService();

export function getFormService(): FormService {
  return service;
}

export function setFormService(next: FormService): void {
  service = next;
}
