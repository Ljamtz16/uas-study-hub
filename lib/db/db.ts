import Dexie, { type EntityTable } from "dexie";
import type { LearningEvidence, NoteRecord, StudySession, TopicProgress } from "@/lib/learning/types";

export class StudyHubDatabase extends Dexie {
  studySessions!:EntityTable<StudySession,"id">;
  learningEvidence!:EntityTable<LearningEvidence,"id">;
  topicProgress!:EntityTable<TopicProgress,"topicId">;
  notes!:EntityTable<NoteRecord,"id">;

  constructor(){
    super("uas-study-hub");
    this.version(1).stores({
      studySessions:"id, startedAt, *topicIds, mode",
      learningEvidence:"id, topicId, type, occurredAt, *conceptIds, *skillIds",
      topicProgress:"topicId, status, masteryScore, lastStudiedAt, reviewDueAt",
      notes:"id, topicId, updatedAt",
    });
  }
}

export const db=new StudyHubDatabase();
