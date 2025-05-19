import { IQuery } from "@backend/interfaces/query/IQuery";
import { IQueryExtractor } from "@backend/interfaces/query/IQueryExtractor";
import { QueryExtractor } from "@backend/utils/query/QueryExtractor";
import { QueryValidationService } from "./QueryValidationService";
import { IQueryValidator, QueryValidationResult } from "@backend/interfaces/query";
import { SQLQueryValidator } from "@backend/utils/query/SQLQueryValidator";
import { MongoQueryValidator } from "@backend/utils/query/MongoQueryValidator";

export class QueryReportProcessor {
  private static instance: QueryReportProcessor;

  private queryExtractor: IQueryExtractor;
  private queryValidationService: QueryValidationService;

  constructor() {
    this.queryExtractor = new QueryExtractor();

    const sqlValidator = new SQLQueryValidator();
    const mongoValidator = new MongoQueryValidator();

    const validatorConfig: { [language: string]: IQueryValidator } = {
      "sql": sqlValidator,
      "javascript": mongoValidator,
      "mongodb": mongoValidator,
    };

    this.queryValidationService = new QueryValidationService(validatorConfig);
  }

  public static getInstance(): QueryReportProcessor {
    if (!QueryReportProcessor.instance) {
      QueryReportProcessor.instance = new QueryReportProcessor();
    }
    return QueryReportProcessor.instance;
  }


  public processReport(report: string): QueryValidationResult[] {
    const extractedQueries: IQuery[] = this.extractQueries(report);
    const validationResults: QueryValidationResult[] = this.validateQueries(extractedQueries);
    return validationResults;
  }

  public extractQueries(report: string): IQuery[] {
    const extractedQueries: IQuery[] = this.queryExtractor.extract(report);
    return extractedQueries;
  }

  public validateQueries(queries: IQuery[]): QueryValidationResult[] {
    const validationResults: QueryValidationResult[] = this.queryValidationService.validateQueries(queries);
    return validationResults;
  }
}