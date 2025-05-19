import { IQuery } from "./IQuery";

export interface IQueryExtractor {
  extract(content: string): IQuery[];
}