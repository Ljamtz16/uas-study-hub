export * from "../../learning-engine.types.v0.1";

import type { AcademicEvent, StableId, StudySession, Topic, TopicProgress } from "../../learning-engine.types.v0.1";

export interface RecommendationContext {
  topics: Topic[];
  progress: TopicProgress[];
  sessions?: StudySession[];
  events?: AcademicEvent[];
  now?: string;
}

export interface NoteRecord {
  id: StableId;
  topicId: StableId;
  body: string;
  createdAt: string;
  updatedAt: string;
}
