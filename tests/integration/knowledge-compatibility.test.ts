import "fake-indexeddb/auto";
import {afterEach,it,expect} from "vitest";
import {db} from "@/lib/db/db";
import {markTopicStudied,saveActivity,saveNote,exportLocalData} from "@/lib/db/repositories/learning";
import {useProgressStore} from "@/features/progress/store";
import {topicGraphState} from "@/lib/content/knowledge-graph";
afterEach(async()=>{await db.delete();await db.open();});
it("KG-04/KG-07 V0.2 private records remain identical after V0.3 hydration",async()=>{const id="fund-radio-links-intro";await markTopicStudied(id);await saveActivity(id,{type:"recall",score:1,response:"Respuesta V0.2"});await saveActivity(id,{type:"quiz",answers:[0,1]});await saveNote(id,"Nota V0.2");await db.studySessions.add({id:"v02",topicIds:[id],mode:"mixed",startedAt:"2026-09-01T00:00:00Z"});const before=await exportLocalData();db.close();await db.open();await useProgressStore.getState().load();const after=await exportLocalData();for(const key of ["notes","learningEvidence","studySessions","topicProgress"] as const)expect(after[key]).toEqual(before[key]);expect(after.schemaVersion).toBe(1);expect(useProgressStore.getState().progress[id].masteryScore).toBe(65);});
it("KG-06 graph displays persisted Topic mastery without changing it",async()=>{await markTopicStudied("fund-uas-types");db.close();await db.open();await useProgressStore.getState().load();expect(topicGraphState(useProgressStore.getState().progress["fund-uas-types"])).toEqual({score:10,status:"studying"});});
