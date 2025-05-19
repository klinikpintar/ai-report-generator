import { IQuery } from "./IQuery";

export type QueryValidationResult = {
  isValid: boolean;
  query?: IQuery;
  validatorType?: string;
  message?: string;
  skippedValidation?: boolean;
};