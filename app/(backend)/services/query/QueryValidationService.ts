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
        warningMessage: `We don't provide validator for ${query.language} language`, 
      };
      if (validator) {
        try {
          result = validator.validate(query.code);
        } catch { 
          result = {
            isValid: false,
            errorMessage: "Failed to validate this query. It may be invalid or not supported.",
          };
        }
      }
      result.query = query
      results.push(result);
    }
    return results;
  }
}