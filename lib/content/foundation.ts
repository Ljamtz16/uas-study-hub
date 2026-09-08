import data from "@/content/courses/fundamentals-uas/foundation.v0.3.json";
import block from "@/content/courses/fundamentals-uas/blocks/fundamentals-block-01.json";
import type {Block,Topic,LearningObjective} from "@/lib/learning/types";

export const academicSource=data.source;
export const academicRecords=data.topics;
export const canonicalBlock:Block=block;
export const canonicalTopics:Topic[]=academicRecords.map(record=>({id:record.stable_id,blockId:record.block_id,title:record.title,difficulty:"foundation",order:record.order,contentRef:record.content_ref,objectiveIds:record.objectives.map(o=>o.id),conceptIds:record.concept_ids,skillIds:record.skill_ids,prerequisiteTopicIds:[],relatedTopicIds:[]}));
export const canonicalObjectives:LearningObjective[]=academicRecords.flatMap(record=>record.objectives.map(objective=>({id:objective.id,topicId:record.stable_id,text:objective.text,conceptIds:record.concept_ids,skillIds:record.skill_ids})));
export const academicRecord=(id:string)=>academicRecords.find(record=>record.stable_id===id);
export const isLegacyTopic=(id:string)=>id==="fund-radio-links-intro";
