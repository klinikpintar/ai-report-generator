import { Platform } from "./platform";
import { Schema } from "./schema";

export type Service = {
  id: string;
  name: string;
  platformCode: Platform;
  createdAt: string;
  schemas?: Schema[];
}