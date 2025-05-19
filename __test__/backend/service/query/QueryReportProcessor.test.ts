import { QueryReportProcessor } from '@backend/services/query/QueryReportProcessor';
import { IQuery } from '@backend/interfaces/query/IQuery';
import { QueryValidationResult } from '@backend/interfaces/query';
import { QueryExtractor } from '@backend/utils/query/QueryExtractor';
import { QueryValidationService } from '@backend/services/query/QueryValidationService';
import { SQLQueryValidator } from '@backend/utils/query/SQLQueryValidator';
import { MongoQueryValidator } from '@backend/utils/query/MongoQueryValidator';

// Mock the dependencies
jest.mock('@backend/utils/query/QueryExtractor');
jest.mock('@backend/services/query/QueryValidationService');
jest.mock('@backend/utils/query/SQLQueryValidator');
jest.mock('@backend/utils/query/MongoQueryValidator');

const MockQueryExtractor = QueryExtractor as jest.MockedClass<typeof QueryExtractor>;
const MockQueryValidationService = QueryValidationService as jest.MockedClass<typeof QueryValidationService>;
const MockSQLQueryValidator = SQLQueryValidator as jest.MockedClass<typeof SQLQueryValidator>;
const MockMongoQueryValidator = MongoQueryValidator as jest.MockedClass<typeof MongoQueryValidator>;

describe('QueryReportProcessor', () => {
  let mockExtract: jest.Mock;
  let mockValidateQueriesService: jest.Mock;

  beforeEach(() => {
    MockQueryExtractor.mockClear();
    MockQueryValidationService.mockClear();
    MockSQLQueryValidator.mockClear();
    MockMongoQueryValidator.mockClear();

    mockExtract = jest.fn();
    MockQueryExtractor.prototype.extract = mockExtract;

    mockValidateQueriesService = jest.fn();
    MockQueryValidationService.prototype.validateQueries = mockValidateQueriesService;

    (QueryReportProcessor as unknown as { instance: QueryReportProcessor | undefined }).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return an instance of QueryReportProcessor', () => {
      const instance = QueryReportProcessor.getInstance();
      expect(instance).toBeInstanceOf(QueryReportProcessor);
    });

    it('should return the same instance on subsequent calls', () => {
      const instance1 = QueryReportProcessor.getInstance();
      const instance2 = QueryReportProcessor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('constructor', () => {
    it('should instantiate QueryExtractor', () => {
      QueryReportProcessor.getInstance();
      expect(MockQueryExtractor).toHaveBeenCalledTimes(1);
    });

    it('should instantiate SQLQueryValidator and MongoQueryValidator', () => {
      QueryReportProcessor.getInstance();
      expect(MockSQLQueryValidator).toHaveBeenCalledTimes(1);
      expect(MockMongoQueryValidator).toHaveBeenCalledTimes(1);
    });

    it('should instantiate QueryValidationService with correct validator config', () => {
      QueryReportProcessor.getInstance();
      expect(MockQueryValidationService).toHaveBeenCalledTimes(1);

      const expectedConfig = {
        "sql": expect.any(MockSQLQueryValidator),
        "javascript": expect.any(MockMongoQueryValidator),
        "mongodb": expect.any(MockMongoQueryValidator),
      };
      expect(MockQueryValidationService).toHaveBeenCalledWith(expectedConfig);
    });
  });

  describe('extractQueries', () => {
    it('should call queryExtractor.extract with the given report', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "```sql\nSELECT * FROM users;\n```";
      const mockExtractedQueries: IQuery[] = [{ language: 'sql', id: '', code: 'SELECT * FROM users;' }];
      mockExtract.mockReturnValue(mockExtractedQueries);

      const result = processor.extractQueries(report);

      expect(mockExtract).toHaveBeenCalledWith(report);
      expect(result).toEqual(mockExtractedQueries);
    });

    it('should return an empty array if extractor returns empty', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "No queries here.";
      mockExtract.mockReturnValue([]);

      const result = processor.extractQueries(report);
      expect(mockExtract).toHaveBeenCalledWith(report);
      expect(result).toEqual([]);
    });
  });

  describe('validateQueries', () => {
    it('should call queryValidationService.validateQueries with the given queries', () => {
      const processor = QueryReportProcessor.getInstance();
      const queries: IQuery[] = [{ language: 'sql', id: 'q1', code: 'SELECT 1;' }];
      const mockValidationResults: QueryValidationResult[] = [
        { query: queries[0], isValid: true, validatorType: 'SQLValidator', skippedValidation: false },
      ];
      mockValidateQueriesService.mockReturnValue(mockValidationResults);

      const result = processor.validateQueries(queries);

      expect(mockValidateQueriesService).toHaveBeenCalledWith(queries);
      expect(result).toEqual(mockValidationResults);
    });

    it('should return an empty array if validation service returns empty (e.g., for empty input)', () => {
        const processor = QueryReportProcessor.getInstance();
        const queries: IQuery[] = [];
        mockValidateQueriesService.mockReturnValue([]);

        const result = processor.validateQueries(queries);
        expect(mockValidateQueriesService).toHaveBeenCalledWith(queries);
        expect(result).toEqual([]);
    });
  });

  describe('processReport', () => {
    it('should orchestrate extraction and validation', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "```sql\nSELECT * FROM test;\n```\n```javascript\nconsole.log('hello');\n```";

      const extractedQueries: IQuery[] = [
        { language: 'sql', id: '', code: 'SELECT * FROM test;' },
        { language: 'javascript', id: '', code: "console.log('hello');" },
      ];
      mockExtract.mockReturnValue(extractedQueries);

      const validationResults: QueryValidationResult[] = [
        { query: extractedQueries[0], isValid: true, validatorType: 'SQLValidator', skippedValidation: false },
        { query: extractedQueries[1], isValid: true, validatorType: 'MongoValidator', skippedValidation: false },
      ];
      mockValidateQueriesService.mockReturnValue(validationResults);

      const result = processor.processReport(report);

      expect(mockExtract).toHaveBeenCalledWith(report);
      expect(mockValidateQueriesService).toHaveBeenCalledWith(extractedQueries);
      expect(result).toEqual(validationResults);
    });

    it('should return empty validation results if report contains no queries', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "This report has no code blocks.";
      mockExtract.mockReturnValue([]); // Extractor finds no queries
      mockValidateQueriesService.mockReturnValue([]); // Validation service receives empty, returns empty

      const result = processor.processReport(report);

      expect(mockExtract).toHaveBeenCalledWith(report);
      expect(mockValidateQueriesService).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it('should handle a scenario where queries are extracted but all are skipped by validation', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "```python\nprint('unsupported')\n```";
      const extractedQueries: IQuery[] = [
        { language: 'python', id: '', code: "print('unsupported')" }
      ];
      mockExtract.mockReturnValue(extractedQueries);

      const validationResults: QueryValidationResult[] = [
        {
          query: extractedQueries[0],
          isValid: false,
          validatorType: 'Unknown',
          skippedValidation: true,
          message: 'No validator found for the language: python',
        },
      ];
      mockValidateQueriesService.mockReturnValue(validationResults);

      const result = processor.processReport(report);
      expect(mockExtract).toHaveBeenCalledWith(report);
      expect(mockValidateQueriesService).toHaveBeenCalledWith(extractedQueries);
      expect(result).toEqual(validationResults);
    });

     it('should correctly pass queries from extractor to validator service', () => {
      const processor = QueryReportProcessor.getInstance();
      const report = "```sql id=q1\nSELECT 1;\n```";
      const specificQuery: IQuery = { language: 'sql', id: 'q1', code: 'SELECT 1;' };
      mockExtract.mockReturnValue([specificQuery]);

      const specificValidationResult: QueryValidationResult = {
        query: specificQuery,
        isValid: true,
        validatorType: 'SQLValidatorForTest',
        skippedValidation: false
      };
      mockValidateQueriesService.mockReturnValue([specificValidationResult]);

      processor.processReport(report);

      // Check that the exact object from extraction was passed to validation
      expect(mockValidateQueriesService).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            language: 'sql',
            id: 'q1',
            code: 'SELECT 1;'
          })
        ])
      );
    });
  });
});