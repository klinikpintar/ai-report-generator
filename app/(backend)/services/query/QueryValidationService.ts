import { QueryValidationResult } from "@backend/interfaces/query/QueryValidationResult";
import { IQuery } from "../../interfaces/query/IQuery";
import { IQueryValidator } from "../../interfaces/query/IQueryValidator";


export class QueryValidationService {
  private validators: Map<string, IQueryValidator>;

  constructor(validatorConfig: { [language: string]: IQueryValidator }) {
    this.validators = new Map();
    for (const lang in validatorConfig) {
      this.validators.set(lang.toLowerCase(), validatorConfig[lang]);
    }
  }

  public validateQueries(queries: IQuery[]): QueryValidationResult[] {
    const results: QueryValidationResult[] = [];

    for (const query of queries) {
      const languageKey = query.language.toLowerCase();
      const validator = this.validators.get(languageKey);

      let result: QueryValidationResult = {
        isValid: false,
        validatorType: "Unknown",
        skippedValidation: true,
        message: `No validator found for the language: ${query.language}`,
      };
      if (validator) {
        try {
          result = validator.validate(query.code);
        } catch { 
          result = {
            isValid: false,
            validatorType: validator.constructor.name,
            skippedValidation: false,
            message: "Error during validation",
          };
        }
      }
      result.query = query
      results.push(result);
    }
    return results;
  }
}