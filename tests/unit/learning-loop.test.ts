import {describe,it,expect} from "vitest";
import {calculateTopicMastery} from "@/lib/learning/mastery";
import {masteryConfig,recommendationConfig} from "@/lib/learning/config";
import {activities,quizScore,topicAction} from "@/lib/learning/activities";
import {getNextStudyAction} from "@/lib/learning/recommendations";
import {topics} from "@/lib/content/catalog";
import type {LearningEvidence} from "@/lib/learning/types";
const id=activities.topicId;
const e=(type:LearningEvidence["type"],normalizedScore=1,hour=0):LearningEvidence=>({id:`${type}-${hour}`,topicId:id,type,normalizedScore,occurredAt:new Date(Date.UTC(2026,8,1,hour)).toISOString()});
const calc=(entries:LearningEvidence[],config=masteryConfig)=>calculateTopicMastery(id,entries,config);
describe("V0.2 acceptance",()=>{
  it("R-01 Study alone cannot create Understood or Mastered",()=>{const p=calc([e("study")]);expect(p.masteryScore).toBe(10);expect(p.status).toBe("studying");});
  it("R-02 Recall modifies mastery deterministically, including recent aggregation",()=>{expect(calc([e("study"),e("recall",.5)]).masteryScore).toBe(20);expect(calc([e("study"),e("recall",0),e("recall",1,1)]).masteryScore).toBe(24);expect(calc([e("study"),e("recall",0),e("recall",.5,1),e("recall",1,2)]).masteryScore).toBe(25);});
  it("R-03 Quiz modifies mastery deterministically",()=>{expect(calc([e("study"),e("quiz",.5)]).masteryScore).toBe(28);expect(calc([e("study"),e("quiz",1)]).masteryScore).toBe(45);});
  it("R-04 Understood requires configured score and evidence thresholds",()=>{const entries=[e("study"),e("recall",1),e("quiz",1)];expect(calc(entries,{...masteryConfig,understoodScore:66}).status).toBe("studying");expect(calc(entries,{...masteryConfig,understoodScore:65}).status).toBe("understood");expect(calc([e("study"),e("recall",.69),e("quiz",.69),e("application")]).status).toBe("studying");expect(calc([e("study"),e("recall",.7),e("quiz",.7),e("application")]).status).toBe("understood");});
  it("R-05 Mastered requires successful reviews separated by 24 hours",()=>{const entries=[e("study"),e("recall"),e("quiz"),e("application")];expect(calc(entries).status).not.toBe("mastered");expect(calc([...entries,e("review"),e("review",1,23)]).status).not.toBe("mastered");expect(calc([...entries,e("review"),e("review",.5,24)]).status).not.toBe("mastered");expect(calc([...entries,e("review"),e("review",1,24)]).status).toBe("mastered");});
  it("validates complete quiz answers and normalized score",()=>{expect(quizScore([0,1])).toBe(1);expect(quizScore([0,0])).toBe(.5);expect(quizScore([1,0])).toBe(0);for(const answers of [[],new Array<number>(2),[0,9],[0,NaN]])expect(()=>quizScore(answers)).toThrow();});
  it("advances actions even for zero-score attempts and retains recommendation bands",()=>{const study=e("study"),recall=e("recall",0),quiz=e("quiz",0);expect(topicAction().label).toBe("Study");expect(topicAction(calc([study]),[study]).label).toBe("Active Recall");expect(topicAction(calc([study,recall]),[study,recall]).label).toBe("Quiz");const entries=[study,recall,quiz],p=calc(entries);expect(topicAction(p,entries).label).toBe("Continuar el tema");expect(topicAction(p,entries).reason).toContain("reforzar");expect(getNextStudyAction({topics,progress:[p]},recommendationConfig)?.priorityScore).toBe(100);});
});
