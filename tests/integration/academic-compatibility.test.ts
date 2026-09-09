import "fake-indexeddb/auto";
import {it,expect,afterEach} from "vitest";
import {db} from "@/lib/db/db";
import {markTopicStudied,saveActivity,saveNote,exportLocalData} from "@/lib/db/repositories/learning";
import {useProgressStore} from "@/features/progress/store";
afterEach(async()=>{await db.delete();await db.open();});
it("ACAD-15 V0.2 and V0.3 records remain identical",async()=>{for(const id of ["fund-radio-links-intro","fund-uas-types"]){await markTopicStudied(id);await saveNote(id,"Nota preservada");await db.studySessions.add({id:`session-${id}`,topicIds:[id],mode:"learn",startedAt:"2026-09-01T00:00:00Z"});}await saveActivity("fund-radio-links-intro",{type:"quiz",answers:[0,1]});const before=await exportLocalData();db.close();await db.open();await useProgressStore.getState().load();const after=await exportLocalData();for(const key of ["learningEvidence","topicProgress","notes","studySessions"] as const)expect(after[key]).toEqual(before[key]);});
it("ACAD-16 Dexie schema remains v1",()=>expect(db.verno).toBe(1));
