export interface QueryValidationResult {
  isValid: boolean;
  query: {
    id: string;
    language: string;
    code: string;
  };
  errorMessage?: string;
  warningMessage?: string;
}