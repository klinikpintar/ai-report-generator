import { BaseModel, Platform } from ".";

export interface Service extends BaseModel {
  name: string;
  platform: Platform;
  platformCode: string;
}