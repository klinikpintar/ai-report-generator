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
      };
    } catch {
      return {
        isValid: false,
        errorMessage: "This SQL query is either invalid or not supported by our validator",
      };
    }
  }
}