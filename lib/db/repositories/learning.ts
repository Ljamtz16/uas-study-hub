import { db } from "../db";
import { masteryConfig } from "@/lib/learning/config";
import { recordEvidence } from "@/lib/learning/evidence";
import { calculateTopicMastery } from "@/lib/learning/mastery";
import type { NoteRecord, TopicProgress } from "@/lib/learning/types";

export async function markTopicStudied(topicId:string):Promise<TopicProgress>{
  return db.transaction("rw",db.learningEvidence,db.topicProgress,async()=>{
    const evidence=await recordEvidence({topicId,type:"study",normalizedScore:1,sourceKind:"manual"});
    await db.learningEvidence.add(evidence);
    const allEvidence=await db.learningEvidence.where("topicId").equals(topicId).toArray();
    const previous=await db.topicProgress.get(topicId);
    const progress=calculateTopicMastery(topicId,allEvidence,masteryConfig,previous);
    await db.topicProgress.put(progress);
    return progress;
  });
}

export async function saveNote(topicId:string,body:string):Promise<NoteRecord>{
  const id=`note-${topicId}`,existing=await db.notes.get(id),now=new Date().toISOString();
  const note:NoteRecord={id,topicId,body,createdAt:existing?.createdAt??now,updatedAt:now};
  await db.notes.put(note);
  return note;
}

export async function exportLocalData(){
  const [studySessions,learningEvidence,topicProgress,notes]=await Promise.all([db.studySessions.toArray(),db.learningEvidence.toArray(),db.topicProgress.toArray(),db.notes.toArray()]);
  return {schemaVersion:1,exportedAt:new Date().toISOString(),studySessions,learningEvidence,topicProgress,notes};
}
