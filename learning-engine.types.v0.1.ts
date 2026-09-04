/**
 * UAS Study Hub — Learning Domain Contracts v0.1
 * Decision: DEC-20260903-001
 *
 * Goals:
 * - stable IDs
 * - content separated from personal learning data
 * - deterministic/offline-friendly learning engine
 * - no dependency on UI, Supabase or AI
 */

export type StableId = string;

export type Difficulty = "foundation" | "intermediate" | "advanced";

export type TopicStatus =
  | "pending"
  | "studying"
  | "understood"
  | "mastered"
  | "reinforce";

export type EvidenceType =
  | "study"
  | "recall"
  | "quiz"
  | "review"
  | "application";

export type RelationType =
  | "prerequisite_of"
  | "part_of"
  | "used_by"
  | "applies_to"
  | "related_to"
  | "measured_by";

export type RecommendationReasonCode =
  | "upcoming_event"
  | "review_due"
  | "weak_prerequisite"
  | "continue_recent"
  | "next_sequential";

export interface Course {
  id: StableId;
  title: string;
  ects?: number;
  type?: string;
  order: number;
  description?: string;
}

export interface Block {
  id: StableId;
  courseId: StableId;
  title: string;
  order: number;
}

export interface Topic {
  id: StableId;
  blockId: StableId;
  title: string;
  difficulty: Difficulty;
  order: number;
  contentRef: string;

  objectiveIds: StableId[];
  conceptIds: StableId[];
  skillIds: StableId[];

  prerequisiteTopicIds: StableId[];
  relatedTopicIds: StableId[];

  labId?: StableId;
}

export interface Concept {
  id: StableId;
  title: string;
  primaryTopicId: StableId;
  descriptionRef?: string;
  tags?: string[];
}

export interface Skill {
  id: StableId;
  title: string;
  description: string;
  requiredConceptIds: StableId[];
  primaryTopicId?: StableId;
}

export interface LearningObjective {
  id: StableId;
  topicId: StableId;
  text: string;
  conceptIds: StableId[];
  skillIds: StableId[];
}

export interface ConceptEdge {
  id: StableId;
  sourceId: StableId;
  targetId: StableId;
  relationType: RelationType;
  rationale?: string;
}

export interface StudySession {
  id: StableId;
  startedAt: string;
  endedAt?: string;
  topicIds: StableId[];
  mode: "orient" | "learn" | "recall" | "practice" | "review" | "mixed";
  durationSeconds?: number;
}

export interface LearningEvidence {
  id: StableId;
  topicId: StableId;
  type: EvidenceType;

  /**
   * Normalized score from 0 to 1.
   * Examples:
   * - completed study: 1
   * - recall 4/5: 0.8
   * - quiz 8/10: 0.8
   */
  normalizedScore: number;

  occurredAt: string;

  conceptIds?: StableId[];
  skillIds?: StableId[];

  sourceId?: StableId;
  sourceKind?: "study_session" | "question_attempt" | "review_log" | "application_rubric" | "manual";

  metadata?: Record<string, string | number | boolean | null>;
}

export interface MasteryBreakdown {
  study: number;       // 0..1
  recall: number;      // 0..1
  quiz: number;        // 0..1
  review: number;      // 0..1
  application: number; // 0..1
}

export interface TopicProgress {
  topicId: StableId;

  status: TopicStatus;

  /**
   * 0..100. Derived from LearningEvidence.
   */
  masteryScore: number;

  /**
   * 0..100. Tracks coverage/completion separately from mastery.
   */
  completionScore: number;

  breakdown: MasteryBreakdown;

  lastStudiedAt?: string;
  lastEvidenceAt?: string;
  reviewDueAt?: string;

  reinforceReason?: string;
  updatedAt: string;
}

export interface SkillMastery {
  skillId: StableId;
  masteryScore: number;
  evidenceCount: number;
  lastEvidenceAt?: string;
}

export interface AcademicEvent {
  id: StableId;
  type: "class" | "exam" | "deadline" | "practice" | "other";
  title: string;
  start: string;
  end?: string;
  courseId?: StableId;
  topicIds?: StableId[];
}

export interface Recommendation {
  id: StableId;
  topicId: StableId;
  reasonCode: RecommendationReasonCode;

  /**
   * Deterministic ranking score.
   * Higher = more urgent.
   */
  priorityScore: number;

  reasonText: string;
  estimatedMinutes?: number;
  generatedAt: string;

  supportingIds?: StableId[];
}

export interface MasteryConfig {
  weights: {
    study: number;       // default 10
    recall: number;      // default 20
    quiz: number;        // default 35
    review: number;      // default 25
    application: number; // default 10
  };

  understoodScore: number; // default 50
  masteredScore: number;   // default 75

  weakAttemptThreshold: number; // default 0.60
  understoodEvidenceThreshold: number; // default 0.70

  minSuccessfulSpacedReviewsForMastery: number; // default 2
  minReviewSeparationHours: number; // default 24
}

export interface RecommendationConfig {
  eventBand: number;        // default 500
  reviewBand: number;       // default 400
  prerequisiteBand: number; // default 300
  continuationBand: number; // default 200
  sequentialBand: number;   // default 100

  upcomingEventWindowDays: number; // default 7
  recentSessionWindowHours: number; // default 24
}
