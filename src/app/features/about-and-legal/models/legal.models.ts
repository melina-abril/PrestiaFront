export interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export interface LegalDocument {
  readonly slug: string;
  readonly title: string;
  readonly updatedAt: string;
  readonly sections: readonly LegalSection[];
}

/** Los documentos se mantienen separados para facilitar su revisión y sustitución por el área legal. */
import { LEGAL_NOTICE } from './documents/legal-notice';
import { PRIVACY_POLICY } from './documents/privacy-policy';
import { TERMS_AND_CONDITIONS } from './documents/terms-and-conditions';
import { COOKIE_POLICY } from './documents/cookie-policy';

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  LEGAL_NOTICE,
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
  COOKIE_POLICY,
];
