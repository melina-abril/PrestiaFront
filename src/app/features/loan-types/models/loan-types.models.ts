export interface LoanTypeSummaryResponse {
  slug: string;
  title: string;
  icon: string;
  summary: string;
}

export interface LoanTypeQuestionResponse {
  question: string;
  answer: string;
}

export interface RelatedLoanTypeResponse {
  slug: string;
  title: string;
}

export interface LoanTypeLenderResponse {
  id: string;
  name: string;
  initials: string;
  minAmount: number;
  maxAmount: number;
  minTermDays: number;
  maxTermDays: number;
  minAge: number;
  maxAge: number;
  firstLoanFree: boolean;
  acceptsAsnef: boolean;
  noPayslip: boolean;
  responseMinutes: number;
  recommended: boolean;
}

export interface LoanTypeResponse extends LoanTypeSummaryResponse {
  subtitle: string;
  tags: string[];
  criterion: string;
  requirements: string[];
  advantages: string[];
  disadvantages: string[];
  questions: LoanTypeQuestionResponse[];
  related: RelatedLoanTypeResponse[];
  metaTitle: string;
  metaDescription: string;
  lenders: LoanTypeLenderResponse[];
}
