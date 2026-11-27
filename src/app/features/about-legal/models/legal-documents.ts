import { COOKIE_POLICY } from './cookie-policy';
import { LEGAL_NOTICE } from './legal-notice';
import { LegalDocument } from './legal.models';
import { PRIVACY_POLICY } from './privacy-policy';
import { TERMS_AND_CONDITIONS } from './terms-and-conditions';

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  LEGAL_NOTICE,
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
  COOKIE_POLICY,
];
