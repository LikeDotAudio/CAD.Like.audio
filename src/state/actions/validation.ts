import type { EditorStore } from '../EditorStore';
import type { ValidationResult } from '../../core/types';
import { validateGeometry } from '../../model/validate/validateGeometry';

export function validation(store: EditorStore): ValidationResult {
  if (store.validationCache?.version === store.docVersion) return store.validationCache.result;
  const result = validateGeometry(store.doc);
  store.validationCache = { version: store.docVersion, result };
  return result;

}
