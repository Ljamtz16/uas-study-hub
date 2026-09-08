"use client";
import { create } from "zustand";
import { db } from "@/lib/db/db";
import { markTopicStudied } from "@/lib/db/repositories/learning";
import type { TopicProgress } from "@/lib/learning/types";
import type { LearningEvidence, StudySession } from "@/lib/learning/types";
import { calculateTopicMastery } from "@/lib/learning/mastery";
import { masteryConfig } from "@/lib/learning/config";

interface ProgressState{progress:Record<string,TopicProgress>;evidence:LearningEvidence[];sessions:StudySession[];hydrated:boolean;load:()=>Promise<void>;markStudied:(topicId:string)=>Promise<TopicProgress>}
export const useProgressStore=create<ProgressState>((set,get)=>({
  progress:{},evidence:[],sessions:[],hydrated:false,
  load:async()=>{const [rows,evidence,sessions]=await Promise.all([db.topicProgress.toArray(),db.learningEvidence.toArray(),db.studySessions.toArray()]);const progress=Object.fromEntries(rows.map(item=>[item.topicId,item]));for(const topicId of new Set(evidence.map(item=>item.topicId)))progress[topicId]=calculateTopicMastery(topicId,evidence,masteryConfig,progress[topicId]);set({progress,evidence,sessions,hydrated:true});},
  markStudied:async(topicId)=>{const item=await markTopicStudied(topicId);await get().load();return item;},
}));
