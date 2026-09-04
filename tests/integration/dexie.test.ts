import "fake-indexeddb/auto";
import { afterEach,describe,expect,it } from "vitest";
import { db } from "@/lib/db/db";
import { markTopicStudied,saveNote } from "@/lib/db/repositories/learning";
describe("local persistence",()=>{afterEach(async()=>{await db.delete();await db.open();});it("stores study evidence and derived progress",async()=>{const result=await markTopicStudied("fund-radio-links-intro");expect(result.masteryScore).toBe(10);expect(await db.learningEvidence.where("topicId").equals("fund-radio-links-intro").count()).toBe(1);expect((await db.topicProgress.get("fund-radio-links-intro"))?.status).toBe("studying");});it("stores personal notes separately",async()=>{await saveNote("fund-radio-links-intro","Mi nota");expect((await db.notes.get("note-fund-radio-links-intro"))?.body).toBe("Mi nota");});});
