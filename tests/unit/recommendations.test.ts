import { describe,expect,it } from "vitest";
import { recommendationConfig } from "@/lib/learning/config";
import { generateRecommendations,getNextStudyAction } from "@/lib/learning/recommendations";
import type { RecommendationContext,Topic,TopicProgress } from "@/lib/learning/types";
const topic=(id:string,order:number,prerequisiteTopicIds:string[]=[]):Topic=>({id,blockId:"block",title:id,difficulty:"foundation",order,contentRef:"x",objectiveIds:[],conceptIds:[],skillIds:[],prerequisiteTopicIds,relatedTopicIds:[]});
const progress=(topicId:string,masteryScore=20):TopicProgress=>({topicId,status:"studying",masteryScore,completionScore:0,breakdown:{study:1,recall:0,quiz:0,review:0,application:0},updatedAt:"2026-09-03T00:00:00.000Z"});
const now="2026-09-03T12:00:00.000Z";
describe("recommendations",()=>{
  it("R-01: upcoming event beats next sequential",()=>{const context:RecommendationContext={now,topics:[topic("a",1)],progress:[],events:[{id:"event",type:"exam",title:"Examen",start:"2026-09-04T10:00:00.000Z",topicIds:["a"]}]};expect(getNextStudyAction(context,recommendationConfig)?.reasonCode).toBe("upcoming_event");});
  it("R-02: review due beats weak prerequisite",()=>{const context:RecommendationContext={now,topics:[topic("pre",1),topic("target",2,["pre"])],progress:[{...progress("pre"),reviewDueAt:"2026-09-01T00:00:00.000Z"}]};expect(getNextStudyAction(context,recommendationConfig)?.reasonCode).toBe("review_due");});
  it("R-03: weak prerequisite beats recent continuation",()=>{const context:RecommendationContext={now,topics:[topic("pre",1),topic("target",2,["pre"])],progress:[progress("pre")],sessions:[{id:"session",startedAt:"2026-09-03T11:00:00.000Z",topicIds:["target"],mode:"learn"}]};expect(getNextStudyAction(context,recommendationConfig)?.reasonCode).toBe("weak_prerequisite");});
  it("R-04: defaults to next sequential",()=>{const result=getNextStudyAction({now,topics:[topic("b",2),topic("a",1)],progress:[]},recommendationConfig);expect(result?.topicId).toBe("a");expect(result?.reasonCode).toBe("next_sequential");});
  it("R-05: every recommendation explains why",()=>{const results=generateRecommendations({now,topics:[topic("a",1)],progress:[]},recommendationConfig);expect(results.every(item=>item.reasonText.trim().length>0)).toBe(true);});
});
