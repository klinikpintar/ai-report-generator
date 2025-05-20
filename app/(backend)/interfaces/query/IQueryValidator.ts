import { QueryValidationResult } from "./QueryValidationResult";

export interface IQueryValidator {
  validate(query: string): QueryValidationResult;
}