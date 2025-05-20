import { IQuery } from "./IQuery";

export type QueryValidationResult = {
  isValid: boolean;
  query?: IQuery;
  errorMessage?: string;
  warningMessage?: string;
};