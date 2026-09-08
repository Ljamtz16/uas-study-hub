import "fake-indexeddb/auto";
import {afterEach,describe,expect,it} from "vitest";
import {db} from "@/lib/db/db";
import {markTopicStudied,saveActivity,saveNote,exportLocalData} from "@/lib/db/repositories/learning";
import {useProgressStore} from "@/features/progress/store";
import {activities} from "@/lib/learning/activities";
const id=activities.topicId;
afterEach(async()=>{await db.delete();await db.open();});
describe("V0.1 to V0.2 persistence",()=>{
  it("recall and quiz survive reopen, rebuild mastery, and preserve all V0.1 records",async()=>{
    await markTopicStudied(id);await saveNote(id,"Nota V0.1");
    await db.studySessions.add({id:"session-v01",topicIds:[id],mode:"learn",startedAt:"2026-09-01T00:00:00Z"});
    const before=await exportLocalData();db.close();await db.open();
    const recall=await saveActivity(id,{type:"recall",score:1,response:"Reflexión privada"});
    expect(recall.before.masteryScore).toBe(10);expect(recall.progress.masteryScore).toBe(30);
    const quiz=await saveActivity(id,{type:"quiz",answers:[0,1]});expect(quiz.progress.masteryScore).toBe(65);
    db.close();await db.open();
    expect(await db.learningEvidence.get(recall.evidence.id)).toEqual(recall.evidence);
    expect(await db.learningEvidence.get(quiz.evidence.id)).toEqual(quiz.evidence);
    const after=await exportLocalData();expect(after.schemaVersion).toBe(1);expect(db.verno).toBe(1);
    expect(after.notes).toEqual(before.notes);expect(after.studySessions).toEqual(before.studySessions);expect(after.learningEvidence).toEqual(expect.arrayContaining(before.learningEvidence));
    await db.topicProgress.update(id,{masteryScore:0});
    await useProgressStore.getState().load();expect(useProgressStore.getState().progress[id].masteryScore).toBe(65);expect(useProgressStore.getState().progress[id].status).toBe("understood");
  });
  it("rejects invalid attempts without changing evidence or progress",async()=>{await markTopicStudied(id);const before=await db.topicProgress.get(id);await expect(saveActivity(id,{type:"quiz",answers:[]})).rejects.toThrow();expect(await db.learningEvidence.count()).toBe(1);expect(await db.topicProgress.get(id)).toEqual(before);});
});
