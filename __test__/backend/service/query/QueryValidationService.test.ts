import { QueryValidationService } from '@backend/services/query/QueryValidationService';
import { IQuery } from '@backend/interfaces/query/IQuery';
import { IQueryValidator } from '@backend//interfaces/query/IQueryValidator';
import { QueryValidationResult } from '@backend/interfaces/query/QueryValidationResult';

class MockQueryValidator implements IQueryValidator {
  private shouldBeValid: boolean;
  public validatorName: string;

  constructor(shouldBeValid: boolean, validatorName: string = 'MockValidator') {
    this.shouldBeValid = shouldBeValid;
    this.validatorName = validatorName;
  }

  validate(query: string): QueryValidationResult {
    if (query === 'error_case') {
      throw new Error("Test parser error");
    }
    if (this.shouldBeValid) {
      return {
        isValid: true,
        validatorType: this.validatorName,
        skippedValidation: false,
      };
    } else {
      return {
        isValid: false,
        validatorType: this.validatorName,
        message: 'Invalid query by mock',
        skippedValidation: false,
      };
    }
  }
}

describe('QueryValidationService', () => {
  let sqlValidatorValid: MockQueryValidator;
  let sqlValidatorInvalid: MockQueryValidator;
  let jsValidatorValid: MockQueryValidator;

  beforeEach(() => {
    sqlValidatorValid = new MockQueryValidator(true, 'SQLValidator');
    sqlValidatorInvalid = new MockQueryValidator(false, 'SQLValidator');
    jsValidatorValid = new MockQueryValidator(true, 'JSValidator');
  });

  describe('constructor', () => {
    it('should initialize with an empty validator config', () => {
      const service = new QueryValidationService({});
      expect(service['validators'].size).toBe(0);
    });

    it('should initialize validators and lowercase language keys', () => {
      const config = {
        SQL: sqlValidatorValid,
        JavaScript: jsValidatorValid,
      };
      const service = new QueryValidationService(config);
      expect(service['validators'].get('sql')).toBe(sqlValidatorValid);
      expect(service['validators'].get('javascript')).toBe(jsValidatorValid);
      expect(service['validators'].size).toBe(2);
    });
  });

  describe('validateQueries', () => {
    it('should return an empty array if no queries are provided', () => {
      const service = new QueryValidationService({});
      const results = service.validateQueries([]);
      expect(results).toEqual([]);
    });

    it('should validate a single query with an existing validator (valid case)', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'sql', id: 'q1', code: 'SELECT *' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].validatorType).toBe('SQLValidator');
      expect(results[0].skippedValidation).toBe(false);
      expect(results[0].query).toEqual(queries[0]);
    });

    it('should validate a single query with an existing validator (invalid case)', () => {
      const service = new QueryValidationService({ sql: sqlValidatorInvalid });
      const queries: IQuery[] = [{ language: 'sql', id: 'q2', code: 'SELECT INVALID' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].validatorType).toBe('SQLValidator');
      expect(results[0].skippedValidation).toBe(false);
      expect(results[0].message).toBe('Invalid query by mock');
      expect(results[0].query).toEqual(queries[0]);
    });

    it('should handle case-insensitivity for language lookup', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'SQL', id: 'q3', code: 'SELECT *' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].validatorType).toBe('SQLValidator');
      expect(results[0].skippedValidation).toBe(false);
      expect(results[0].query).toEqual(queries[0]);
    });

    it('should return skipped validation if no validator is found for a language', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'python', id: 'q4', code: 'print("hello")' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(false); // Default for skipped
      expect(results[0].validatorType).toBe('Unknown');
      expect(results[0].skippedValidation).toBe(true);
      expect(results[0].message).toBe('No validator found for the language: python');
      expect(results[0].query).toEqual(queries[0]);
    });

    it('should validate multiple queries with mixed languages and results', () => {
      const service = new QueryValidationService({
        sql: sqlValidatorValid,
        javascript: jsValidatorValid,
        python: sqlValidatorInvalid, 
      });
      const queries: IQuery[] = [
        { language: 'sql', id: 'q_sql_valid', code: 'SELECT *' },
        { language: 'javascript', id: 'q_js_valid', code: 'console.log()' },
        { language: 'python', id: 'q_py_invalid', code: 'import invalid_syntax' },
        { language: 'ruby', id: 'q_ruby_skipped', code: 'puts "hello"' },
        { language: 'SQL', id: 'q_sql_upper', code: 'SELECT name' },
      ];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(5);

      // SQL valid
      expect(results[0].isValid).toBe(true);
      expect(results[0].validatorType).toBe('SQLValidator');
      expect(results[0].skippedValidation).toBe(false);
      expect(results[0].query).toEqual(queries[0]);

      // JS valid
      expect(results[1].isValid).toBe(true);
      expect(results[1].validatorType).toBe('JSValidator');
      expect(results[1].skippedValidation).toBe(false);
      expect(results[1].query).toEqual(queries[1]);

      // Python invalid (using sqlValidatorInvalid mock for this)
      expect(results[2].isValid).toBe(false);
      expect(results[2].validatorType).toBe('SQLValidator'); // Name from the mock
      expect(results[2].skippedValidation).toBe(false);
      expect(results[2].message).toBe('Invalid query by mock');
      expect(results[2].query).toEqual(queries[2]);

      // Ruby skipped
      expect(results[3].isValid).toBe(false);
      expect(results[3].validatorType).toBe('Unknown');
      expect(results[3].skippedValidation).toBe(true);
      expect(results[3].message).toBe('No validator found for the language: ruby');
      expect(results[3].query).toEqual(queries[3]);

      // SQL uppercase (valid)
      expect(results[4].isValid).toBe(true);
      expect(results[4].validatorType).toBe('SQLValidator');
      expect(results[4].skippedValidation).toBe(false);
      expect(results[4].query).toEqual(queries[4]);
    });

    it('should correctly attach the original query object to each result', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const query1: IQuery = { language: 'sql', id: 'q1', code: 'SELECT 1' };
      const query2: IQuery = { language: 'unknown', id: 'q2', code: '?' };
      const queries: IQuery[] = [query1, query2];
      const results = service.validateQueries(queries);

      expect(results[0].query).toBe(query1);
      expect(results[1].query).toBe(query2);
    });

    it('should handle errors from validator.validate gracefully (though current impl. does not catch)', () => {

      const errorThrowingValidator: IQueryValidator = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate: (_query: string) => {
          throw new Error("Validator crashed!");
        }
      };
      const service = new QueryValidationService({ sql: errorThrowingValidator });
      const queries: IQuery[] = [{ language: 'sql', id: 'q_error', code: 'error_case' }];
      const results = service.validateQueries(queries);
      expect(results.length).toBe(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].skippedValidation).toBe(false);
    });
  });
});