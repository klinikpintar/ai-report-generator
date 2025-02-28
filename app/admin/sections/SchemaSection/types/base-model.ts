import { UUID } from "crypto";

export interface BaseModel {
  id: UUID;
  createdAt: Date;
  modifiedAt: Date;
}
