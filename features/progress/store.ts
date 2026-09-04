"use client";
import { create } from "zustand";
import { db } from "@/lib/db/db";
import { markTopicStudied } from "@/lib/db/repositories/learning";
import type { TopicProgress } from "@/lib/learning/types";

interface ProgressState{progress:Record<string,TopicProgress>;hydrated:boolean;load:()=>Promise<void>;markStudied:(topicId:string)=>Promise<TopicProgress>}
export const useProgressStore=create<ProgressState>((set)=>({
  progress:{},hydrated:false,
  load:async()=>{const rows=await db.topicProgress.toArray();set({progress:Object.fromEntries(rows.map(item=>[item.topicId,item])),hydrated:true});},
  markStudied:async(topicId)=>{const item=await markTopicStudied(topicId);set(state=>({progress:{...state.progress,[topicId]:item}}));return item;},
}));
