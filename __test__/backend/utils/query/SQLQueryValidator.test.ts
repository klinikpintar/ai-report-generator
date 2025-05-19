import { QueryValidationResult } from '@backend/interfaces/query';
import { SQLQueryValidator } from '@backend/utils/query/SQLQueryValidator';

describe('SQLQueryValidator', () => {
  let validator: SQLQueryValidator;

  beforeEach(() => {
    validator = new SQLQueryValidator();
  });

  it('should validate a correct SELECT SQL query', () => {
    const query = "SELECT * FROM users WHERE name = 'Alice'";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.skippedValidation).toBe(false);
  });

  it('should validate a correct INSERT SQL query', () => {
    const query = "INSERT INTO products (name, price) VALUES ('Laptop', 1200)";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.skippedValidation).toBe(false);
  });

  it('should validate a correct UPDATE SQL query', () => {
    const query = "UPDATE customers SET city = 'New York' WHERE id = 1";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.skippedValidation).toBe(false);
  });

  it('should validate a correct DELETE SQL query', () => {
    const query = "DELETE FROM orders WHERE order_date < '2024-01-01'";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.skippedValidation).toBe(false);
  });

  it('should invalidate an incorrect SQL query with a syntax error', () => {
    const query = "SELECT FROM users WHERE name = 'Bob'"; // Missing '*' or column names
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.skippedValidation).toBe(false);
  });

  it('should invalidate an SQL query with an unknown keyword', () => {
    const query = "RETRIEVE all FROM employees"; // RETRIEVE is not standard SQL
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.skippedValidation).toBe(false);
    expect(result.message).toBeDefined();
    expect(typeof result.message).toBe('string');
  });

  it('should handle an empty string as an invalid query', () => {
    const query = "";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.skippedValidation).toBe(false);
  });

  it('should handle a query with only comments', () => {
    const query = "-- This is just a comment";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true); 
    expect(result.skippedValidation).toBe(false);
  });

  it('should correctly capture error message if parser throws an Error object', () => {
    const errorMessage = "Specific parser error";
    const mockParse = jest.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    });
    validator.parser.parse = mockParse; // Override the parse method for this test

    const query = "SELECT * FROM test";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(errorMessage);
    expect(result.skippedValidation).toBe(false);
  });

  it('should correctly capture error message if parser throws a string', () => {
    const errorMessage = "A string error from parser";
    const mockParse = jest.fn().mockImplementation(() => {
      throw errorMessage; 
    });
    validator.parser.parse = mockParse;

    const query = "SELECT * FROM another_test";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.message).toBe(errorMessage);
    expect(result.skippedValidation).toBe(false);
  });

   it('should default error message if parser throws an unknown error type', () => {
    const mockParse = jest.fn().mockImplementation(() => {
      throw { someObjectError: true };
    });
    validator.parser.parse = mockParse;

    const query = "SELECT * FROM yet_another_test";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.message).toBeDefined();
    expect(result.skippedValidation).toBe(false);
  });
});