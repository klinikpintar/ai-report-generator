// @ts-expect-error No type definitions available for 'mongodb-stage-validator'
import { accepts as aggregateQueryValidator } from 'mongodb-stage-validator';
// @ts-expect-error No type definitions available for 'mongodb-language-model'
import { accepts as findQueryValidator } from 'mongodb-language-model';
import parser from 'mongodb-query-parser';
import { EJSON } from 'bson';
import { IQueryValidator, QueryValidationResult } from '@backend/interfaces/query';

// Template for MongoDB query validation
abstract class MethodQueryValidator {
  validate(query: string): boolean {
    const unwrapped = this.unwrapQuery(query);
    const parsed = parser(unwrapped);
    const stringified = EJSON.stringify(parsed) as string;
    return this.runValidation(stringified);
  }

  protected abstract unwrapQuery(query: string): string;
  protected abstract runValidation(parsed: string): boolean;
}

class AggregateQueryValidator extends MethodQueryValidator {
  protected unwrapQuery(query: string): string {
    const aggregateIndex = query.indexOf('.aggregate');
    const stageStartIndex = query.indexOf('[', aggregateIndex);
    const stageEndIndex = query.lastIndexOf(']') + 1;
    if (stageStartIndex !== -1 && stageEndIndex !== -1) {
      query = query.slice(stageStartIndex, stageEndIndex);
    }

    return query;
  }

  protected runValidation(parsed: string): boolean {
    return aggregateQueryValidator(parsed);
  }
}

abstract class SingleStageQueryValidator extends MethodQueryValidator {
  abstract getMethodName(): string;
  protected unwrapQuery(query: string): string {
    const prefix = '.' + this.getMethodName() + '(';
    const index = query.indexOf(prefix);
    if (index !== -1) {
      let part = query.slice(index + prefix.length);
      const close = part.lastIndexOf(')');
      if (close !== -1) {
        part = part.slice(0, close).trim();
      }

      return part;
    }
    return query;
  }

  protected runValidation(parsed: string): boolean {
    return findQueryValidator(parsed);
  }
}

class FindQueryValidator extends SingleStageQueryValidator {
  getMethodName(): string {
    return 'find';
  }
}

class FindOneQueryValidator extends SingleStageQueryValidator {
  getMethodName(): string {
    return 'findOne';
  }
}

class CountQueryValidator extends SingleStageQueryValidator {
  getMethodName(): string {
    return 'count';
  }
}

class CountDocumentsQueryValidator extends SingleStageQueryValidator {
  getMethodName(): string {
    return 'countDocuments';
  }
}


// Strategy pattern for MongoDB query validation
export class MongoQueryValidator implements IQueryValidator {
  private validators: { [key: string]: MethodQueryValidator } = {
    '.aggregate': new AggregateQueryValidator(),
    '.findOne': new FindOneQueryValidator(),
    '.find': new FindQueryValidator(),
    '.countDocuments': new CountDocumentsQueryValidator(),
    '.count': new CountQueryValidator(),
  };

  validate(query: string): QueryValidationResult {
    for (const key in this.validators) {
      if (query.includes(key)) {
        const validator = this.validators[key];
        const isValid = validator.validate(query);

        return {
          isValid,
          validatorType: 'MongoQueryValidator',
          skippedValidation: false,
          message: isValid ? undefined : 'Invalid MongoDB query',
        };
      }
    }
    return {
      isValid: false,
      validatorType: 'MongoQueryValidator',
      skippedValidation: true,
      message: 'No validator found for the this MongoDB query method',
    };
  }
}