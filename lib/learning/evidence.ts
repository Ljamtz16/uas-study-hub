import type { EvidenceType, LearningEvidence, StableId } from "./types";

export interface RecordEvidenceInput {
  topicId:StableId;
  type:EvidenceType;
  normalizedScore:number;
  occurredAt?:string;
  conceptIds?:StableId[];
  skillIds?:StableId[];
  sourceId?:StableId;
  sourceKind?:LearningEvidence["sourceKind"];
}

export async function recordEvidence(input:RecordEvidenceInput):Promise<LearningEvidence>{
  if(input.normalizedScore<0||input.normalizedScore>1) throw new RangeError("normalizedScore must be between 0 and 1");
  return {id:crypto.randomUUID(),topicId:input.topicId,type:input.type,normalizedScore:input.normalizedScore,occurredAt:input.occurredAt??new Date().toISOString(),conceptIds:input.conceptIds,skillIds:input.skillIds,sourceId:input.sourceId,sourceKind:input.sourceKind};
}
