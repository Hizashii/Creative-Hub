import { Types } from "mongoose";
import { ProjectModel } from "../models/projects.models";
import { MemberModel } from "../models/project_memebers.models";

export async function getAccessibleProjectIds(
  userId: Types.ObjectId,
  role: string
): Promise<Types.ObjectId[]> {
  if (role === "admin") {
    return (await ProjectModel.find().distinct("_id")) as Types.ObjectId[];
  }
  const owned = await ProjectModel.find({ ownerId: userId }).distinct("_id");
  const memberOf = await MemberModel.find({ userId }).distinct("projectId");
  const set = new Set([...owned.map(String), ...memberOf.map(String)]);
  return [...set].map((id) => new Types.ObjectId(id));
}
