import { describe,expect,it } from "vitest";
import { blocks,courses,topics } from "@/lib/content/catalog";
import { validateCatalog } from "@/lib/content/validation";
describe("content integrity",()=>{
  it("C-01: IDs are unique",()=>expect(validateCatalog()).not.toContain("Course, Block and Topic IDs must be unique."));
  it("C-02: Topic references an existing Block",()=>expect(topics.every(topic=>blocks.some(block=>block.id===topic.blockId))).toBe(true));
  it("C-03: Block references an existing Course",()=>expect(blocks.every(block=>courses.some(course=>course.id===block.courseId))).toBe(true));
});
