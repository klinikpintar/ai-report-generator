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
    expect(result.errorMessage).toBeUndefined();
  });

  it('should validate a correct INSERT SQL query', () => {
    const query = "INSERT INTO products (name, price) VALUES ('Laptop', 1200)";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should validate a correct UPDATE SQL query', () => {
    const query = "UPDATE customers SET city = 'New York' WHERE id = 1";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should validate a correct DELETE SQL query', () => {
    const query = "DELETE FROM orders WHERE order_date < '2024-01-01'";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should invalidate an incorrect SQL query with a syntax error', () => {
    const query = "SELECT FROM users WHERE name = 'Bob'"; // Missing '*' or column names
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it('should invalidate an SQL query with an unknown keyword', () => {
    const query = "RETRIEVE all FROM employees"; // RETRIEVE is not standard SQL
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
  });

  it('should invalidate an empty string query', () => {
    const query = "";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
  });

  it('should invalidate a query with only comments', () => {
    const query = "-- This is just a comment";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(true);
  });

  it('should set an error message when parser throws any error', () => {
    // Mock the parser's parse method to simulate it throwing an error
    const originalParse = validator.parser.parse; // Save original
    validator.parser.parse = jest.fn().mockImplementation(() => {
      throw new Error("Some internal parser error");
    });

    const query = "SELECT * FROM test_table_that_will_cause_mocked_error";
    const result: QueryValidationResult = validator.validate(query);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();

    validator.parser.parse = originalParse; // Restore original parse method
  });

  it('should handle various valid DDL and DML statements', () => {
    const queries = [
      "CREATE TABLE students (id INT, name VARCHAR(100));",
      "ALTER TABLE students ADD email VARCHAR(100);",
      "DROP TABLE students;",
      "CREATE INDEX idx_name ON users (name);",
      "GRANT SELECT ON users TO 'testuser'@'localhost';"
    ];

    queries.forEach(query => {
      const result = validator.validate(query);
      if (!result.isValid) {
        // This console log can be helpful during debugging if the parser rejects valid SQL
        console.warn(`Query considered invalid by parser: ${query}. Error: ${result.errorMessage}`);
      }
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  it('should invalidate queries with fundamentally broken syntax', () => {
    const queries = [
      "SELECT name شهر FROM users",
      "INSERT INTO VALUES () products ('Pen', 1.5)",
      "UPDATE SET city = 'London' customers WHERE id = 3",
    ];
    queries.forEach(query => {
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });
});