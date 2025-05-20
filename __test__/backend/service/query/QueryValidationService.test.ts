/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryValidationService } from '@backend/services/query/QueryValidationService';
import { IQuery } from '@backend/interfaces/query/IQuery';
import { IQueryValidator } from '@backend/interfaces/query/IQueryValidator';
import { QueryValidationResult } from '@backend/interfaces/query/QueryValidationResult';


class MockQueryValidator implements IQueryValidator {
  private shouldBeValid: boolean;
  public validatorIdentifier: string;

  constructor(shouldBeValid: boolean, validatorIdentifier: string = 'MockValidator') {
    this.shouldBeValid = shouldBeValid;
    this.validatorIdentifier = validatorIdentifier;
  }

  validate(queryCode: string): QueryValidationResult {
    if (queryCode === 'trigger_mock_error_throw') {
      throw new Error(`Mock error from ${this.validatorIdentifier}`);
    }
    if (this.shouldBeValid) {
      return {
        isValid: true,

      };
    } else {
      return {
        isValid: false,
        errorMessage: `Invalid query according to ${this.validatorIdentifier}`,
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

      expect((service as any).validators.size).toBe(0);
    });

    it('should initialize validators and lowercase language keys', () => {
      const config = {
        SQL: sqlValidatorValid,
        JavaScript: jsValidatorValid,
      };
      const service = new QueryValidationService(config);
      const validatorsMap = (service as any).validators as Map<string, IQueryValidator>;
      expect(validatorsMap.get('sql')).toBe(sqlValidatorValid);
      expect(validatorsMap.get('javascript')).toBe(jsValidatorValid);
      expect(validatorsMap.size).toBe(2);
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
      const result = results[0];
      expect(result.isValid).toBe(true);
      expect(result.query).toEqual(queries[0]);
      expect(result.errorMessage).toBeUndefined();
      expect(result.warningMessage).toBeUndefined();
    });

    it('should validate a single query with an existing validator (invalid case)', () => {
      const service = new QueryValidationService({ sql: sqlValidatorInvalid });
      const queries: IQuery[] = [{ language: 'sql', id: 'q2', code: 'SELECT INVALID' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid query according to SQLValidator');
      expect(result.query).toEqual(queries[0]);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should handle case-insensitivity for language lookup in validatorConfig', () => {
      const service = new QueryValidationService({ sQl: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'SQL', id: 'q3', code: 'SELECT *' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(true);
      expect(result.query).toEqual(queries[0]);
      expect(result.errorMessage).toBeUndefined();
      expect(result.warningMessage).toBeUndefined();
    });

    it('should return a warning if no validator is found for a language', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'python', id: 'q4', code: 'print("hello")' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe('We don\'t provide validator for python language');
      expect(result.query).toEqual(queries[0]);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return a warning for an empty language string if no validator is configured for it', () => {
      const service = new QueryValidationService({});
      const queries: IQuery[] = [{ language: '', id: 'q_empty_lang', code: 'test' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe('We don\'t provide validator for  language');
      expect(result.query).toEqual(queries[0]);
      expect(result.errorMessage).toBeUndefined();
    });


    it('should validate multiple queries with mixed languages and results', () => {
      const pythonValidatorInvalid = new MockQueryValidator(false, 'PythonValidator');
      const service = new QueryValidationService({
        sql: sqlValidatorValid,
        javascript: jsValidatorValid,
        python: pythonValidatorInvalid,
      });
      const queries: IQuery[] = [
        { language: 'sql', id: 'q_sql_valid', code: 'SELECT *' },
        { language: 'javascript', id: 'q_js_valid', code: 'console.log()' },
        { language: 'python', id: 'q_py_invalid', code: 'import invalid_syntax' },
        { language: 'ruby', id: 'q_ruby_no_validator', code: 'puts "hello"' },
        { language: 'SQL', id: 'q_sql_upper', code: 'SELECT name' },
      ];
      const results = service.validateQueries(queries);
      expect(results.length).toBe(5);


      const resSqlValid = results.find(r => r.query!.id === 'q_sql_valid')!;
      expect(resSqlValid.isValid).toBe(true);
      expect(resSqlValid.query).toEqual(queries[0]);
      expect(resSqlValid.errorMessage).toBeUndefined();
      expect(resSqlValid.warningMessage).toBeUndefined();


      const resJsValid = results.find(r => r.query!.id === 'q_js_valid')!;
      expect(resJsValid.isValid).toBe(true);
      expect(resJsValid.query).toEqual(queries[1]);
      expect(resJsValid.errorMessage).toBeUndefined();
      expect(resJsValid.warningMessage).toBeUndefined();


      const resPyInvalid = results.find(r => r.query!.id === 'q_py_invalid')!;
      expect(resPyInvalid.isValid).toBe(false);
      expect(resPyInvalid.errorMessage).toBe('Invalid query according to PythonValidator');
      expect(resPyInvalid.query).toEqual(queries[2]);
      expect(resPyInvalid.warningMessage).toBeUndefined();


      const resRubyNoValidator = results.find(r => r.query!.id === 'q_ruby_no_validator')!;
      expect(resRubyNoValidator.isValid).toBe(false);
      expect(resRubyNoValidator.warningMessage).toBe('We don\'t provide validator for ruby language');
      expect(resRubyNoValidator.query).toEqual(queries[3]);
      expect(resRubyNoValidator.errorMessage).toBeUndefined();


      const resSqlUpper = results.find(r => r.query!.id === 'q_sql_upper')!;
      expect(resSqlUpper.isValid).toBe(true);
      expect(resSqlUpper.query).toEqual(queries[4]);
      expect(resSqlUpper.errorMessage).toBeUndefined();
      expect(resSqlUpper.warningMessage).toBeUndefined();
    });

    it('should correctly attach the original query object to each result', () => {
      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const query1: IQuery = { language: 'sql', id: 'q1', code: 'SELECT 1' };
      const query2: IQuery = { language: 'unknownLang', id: 'q2', code: '?' };
      const queries: IQuery[] = [query1, query2];
      const results = service.validateQueries(queries);

      expect(results[0].query).toBe(query1);
      expect(results[1].query).toBe(query2);
    });

    it('should handle errors from validator.validate by returning a specific error message', () => {
      const errorThrowingValidator: IQueryValidator = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate: (_queryCode: string): QueryValidationResult => {
          throw new Error("Validator crashed during validation!");
        }
      };
      const service = new QueryValidationService({ sql: errorThrowingValidator });
      const queries: IQuery[] = [{ language: 'sql', id: 'q_error', code: 'some_query_that_will_make_validator_throw' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Failed to validate this query. It may be invalid or not supported.");
      expect(result.query).toEqual(queries[0]);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should use query code "trigger_mock_error_throw" to test mock throwing behavior', () => {


      const service = new QueryValidationService({ sql: sqlValidatorValid });
      const queries: IQuery[] = [{ language: 'sql', id: 'q_mock_throw', code: 'trigger_mock_error_throw' }];
      const results = service.validateQueries(queries);

      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe("Failed to validate this query. It may be invalid or not supported.");
      expect(result.query).toEqual(queries[0]);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should still set query property even when no validator is found', () => {
      const service = new QueryValidationService({});
      const queryWithoutValidator: IQuery = { language: 'nosuchlang', id: 'q_no_val', code: 'noop' };
      const results = service.validateQueries([queryWithoutValidator]);

      expect(results.length).toBe(1);
      expect(results[0].query).toEqual(queryWithoutValidator);
      expect(results[0].isValid).toBe(false);
      expect(results[0].warningMessage).toBe('We don\'t provide validator for nosuchlang language');
      expect(results[0].errorMessage).toBeUndefined();
    });

    it('should still set query property even when validator throws error', () => {
      const errorThrowingValidator: IQueryValidator = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate: (_queryCode: string): QueryValidationResult => {
          throw new Error("Internal validator failure");
        }
      };
      const service = new QueryValidationService({ crashlang: errorThrowingValidator });
      const queryThatCrashes: IQuery = { language: 'crashlang', id: 'q_crash', code: 'trigger_crash' };
      const results = service.validateQueries([queryThatCrashes]);

      expect(results.length).toBe(1);
      expect(results[0].query).toEqual(queryThatCrashes);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errorMessage).toBe("Failed to validate this query. It may be invalid or not supported.");
      expect(results[0].warningMessage).toBeUndefined();
    });
  });
});