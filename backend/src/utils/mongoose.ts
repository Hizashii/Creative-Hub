import { Types } from "mongoose";
import { ApiError } from "./ApiError";

export function parseObjectId(id: string, label = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) throw new ApiError(400, `Invalid ${label}`);
  return new Types.ObjectId(id);
}
