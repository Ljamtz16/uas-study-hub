import { describe,expect,it } from "vitest";
import { masteryConfig } from "@/lib/learning/config";
import { calculateTopicMastery } from "@/lib/learning/mastery";
import type { LearningEvidence,TopicProgress } from "@/lib/learning/types";
const topicId="fund-radio-links-intro";
const evidence=(type:LearningEvidence["type"],normalizedScore:number,occurredAt="2026-09-03T12:00:00.000Z"):LearningEvidence=>({id:`${type}-${occurredAt}`,topicId,type,normalizedScore,occurredAt});
describe("calculateTopicMastery",()=>{
  it("M-01: study alone produces 10 and studying",()=>{const result=calculateTopicMastery(topicId,[evidence("study",1)],masteryConfig);expect(result.masteryScore).toBe(10);expect(result.completionScore).toBe(100);expect(result.status).toBe("studying");});
  it("M-02: study + recall .8 + quiz .8 produces 54 and understood",()=>{const result=calculateTopicMastery(topicId,[evidence("study",1),evidence("recall",.8),evidence("quiz",.8)],masteryConfig);expect(result.masteryScore).toBe(54);expect(result.status).toBe("understood");});
  it("M-03: cannot master without two spaced successful reviews",()=>{const result=calculateTopicMastery(topicId,[evidence("study",1),evidence("recall",1),evidence("quiz",1),evidence("application",1),evidence("review",1)],masteryConfig);expect(result.masteryScore).toBe(100);expect(result.status).not.toBe("mastered");});
  it("M-04: recent weak evidence forces reinforce",()=>{const previous=calculateTopicMastery(topicId,[evidence("study",1),evidence("recall",1),evidence("quiz",1)],masteryConfig);const result=calculateTopicMastery(topicId,[evidence("study",1),evidence("recall",1,"2026-09-01T12:00:00.000Z"),evidence("quiz",1,"2026-09-01T13:00:00.000Z"),evidence("quiz",.5,"2026-09-03T12:00:00.000Z")],masteryConfig,previous as TopicProgress);expect(result.status).toBe("reinforce");});
});
