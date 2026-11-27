export interface LegalSection {
  heading: string;
  paragraphs: readonly string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  updatedAt: string;
  sections: readonly LegalSection[];
}
