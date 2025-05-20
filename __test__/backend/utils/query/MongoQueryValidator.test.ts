/* eslint-disable @typescript-eslint/no-require-imports */
import { MongoQueryValidator } from "@backend/utils/query/MongoQueryValidator";


jest.mock('mongodb-stage-validator', () => ({
  __esModule: true,
  accepts: jest.fn((parsedQuery) => {
    try {
      const query = JSON.parse(parsedQuery);
      return Array.isArray(query) && !parsedQuery.includes('invalid_stage');
    } catch {
      return false;
    }
  }),
  parse: jest.fn((query) => query),
}));

jest.mock('mongodb-language-model', () => ({
  __esModule: true,
  accepts: jest.fn((parsedQuery) => {
    try {
      JSON.parse(parsedQuery);
      return !parsedQuery.includes('invalid_operator');
    } catch {
      return false;
    }
  }),
  parse: jest.fn((query) => query),
}));

describe('MongoQueryValidator', () => {
  let validator: MongoQueryValidator;
  const fixedErrorMessage = 'This MongoDB query is either invalid or not supported by our validator';
  const fixedWarningMessage = 'We don\'t provide validator for this MongoDB query';


  beforeEach(() => {
    validator = new MongoQueryValidator();
    (require('mongodb-stage-validator').accepts as jest.Mock).mockClear();
    (require('mongodb-language-model').accepts as jest.Mock).mockClear();
  });

  describe('.aggregate()', () => {
    it('should validate a syntactically correct aggregate query with a simple pipeline', () => {
      const query = "db.sales.aggregate([ { $match: { item: 'apple' } } ])";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(result.warningMessage).toBeUndefined();
    });

    it('should validate an aggregate query with multiple stages', () => {
      const query = "db.orders.aggregate([ { $match: { status: 'A' } }, { $group: { _id: '$cust_id', total: { $sum: '$amount' } } } ])";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should invalidate an aggregate query with incorrect pipeline syntax (e.g., not an array)', () => {
      (require('mongodb-stage-validator').accepts as jest.Mock).mockImplementationOnce(() => false);
      const query = "db.items.aggregate( { $match: { price: { $gt: 10 } } } )";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should invalidate an aggregate query with an invalid stage operator', () => {
      const query = "db.products.aggregate([ { $invalid_stage: { foo: 'bar' } } ])";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should handle aggregate query with options (validation still focuses on pipeline)', () => {
      const query = "db.cakeSales.aggregate( [ { $match: { salesTotal: { $gt: 300 } } } ], { allowDiskUse: true } )";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should handle an empty pipeline in aggregate if external validator accepts it', () => {
      (require('mongodb-stage-validator').accepts as jest.Mock).mockImplementationOnce((parsedQuery) => {
        try { JSON.parse(parsedQuery); return true; } catch { return false; }
      });
      const query = "db.test.aggregate([])";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should invalidate an aggregate query if the pipeline part is empty after unwrapping and parser fails', () => {
      const query = "db.test.aggregate()";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
    });
  });

  describe('.find()', () => {
    it('should validate a correct find query', () => {
      const query = "db.users.find({ name: 'Alice', age: { $lt: 30 } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(require('mongodb-language-model').accepts).toHaveBeenCalled();
    });

    it('should validate an empty find query (find all)', () => {
      const query = "db.products.find({})";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(require('mongodb-language-model').accepts).toHaveBeenCalled();
    });

    it('should invalidate a find query with incorrect operator syntax', () => {

      const query = "db.users.find({ age: { $invalid_operator: 25 } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
      expect(result.warningMessage).toBeUndefined();
    });

    it('should validate a find query with projection if external validator accepts it', () => {


      (require('mongodb-language-model').accepts as jest.Mock).mockImplementationOnce(() => true);
      const query = "db.inventory.find({ status: 'A' }, { item: 1, status: 1, _id: 0 })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });

  describe('.findOne()', () => {
    it('should validate a correct findOne query', () => {
      const query = "db.sessions.findOne({ sessionId: 'xyz123' })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should validate an empty findOne query', () => {
      const query = "db.settings.findOne({})";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should invalidate a findOne query with syntax errors', () => {
      const query = "db.articles.findOne({ tags: { $invalid_operator: ['tech'] } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
    });
  });

  describe('.count()', () => {
    it('should validate a correct count query', () => {
      const query = "db.events.count({ type: 'ERROR' })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should validate an empty count query (count all)', () => {
      const query = "db.logs.count({})";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });


    it('should invalidate a count query with incorrect field operator', () => {
      const query = "db.notifications.count({ status: { $invalid_operator: 'read' } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
    });
  });

  describe('.countDocuments()', () => {
    it('should validate a correct countDocuments query', () => {
      const query = "db.tasks.countDocuments({ isCompleted: false })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should validate an empty countDocuments query (count all)', () => {
      const query = "db.files.countDocuments({})";
      const result = validator.validate(query);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should invalidate a countDocuments query with a malformed query part', () => {
      const query = "db.data.countDocuments({ value: { $invalid_operator: 100 } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(fixedErrorMessage);
    });
  });

  describe('General and No Validator Found Cases', () => {
    it('should return warning for an unsupported MongoDB method (e.g., updateOne)', () => {
      const query = "db.users.updateOne({ name: 'Bob' }, { $set: { age: 31 } })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe(fixedWarningMessage);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return warning for a query not matching any known method pattern', () => {
      const query = "db.users.nonExistentMethod({ foo: 'bar' })";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe(fixedWarningMessage);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return warning for a query that does not contain any known method key', () => {
      const query = "show collections;";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe(fixedWarningMessage);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return warning for a completely malformed query string that does not include any method', () => {
      const query = "this is not a mongo query";
      const result = validator.validate(query);
      expect(result.isValid).toBe(false);
      expect(result.warningMessage).toBe(fixedWarningMessage);
      expect(result.errorMessage).toBeUndefined();
    });
  });
});