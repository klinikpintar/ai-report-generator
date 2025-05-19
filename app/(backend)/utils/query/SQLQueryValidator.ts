import { QueryValidationResult } from "@backend/interfaces/query";
import { IQueryValidator } from "@backend/interfaces/query/IQueryValidator";
import { Parser } from "node-sql-parser";

export class SQLQueryValidator implements IQueryValidator {
  parser = new Parser();

  validate(query: string): QueryValidationResult {
    try {
      this.parser.parse(query);
      return {
        isValid: true,
        validatorType: this.constructor.name,
        skippedValidation: false,
      };
    } catch (error) {
      let errorMessage = "Invalid SQL query";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        isValid: false,
        validatorType: this.constructor.name,
        message: errorMessage,
        skippedValidation: false,
      };
    }
  }
}