import { blocks, courses, topics } from "./catalog";

export function validateCatalog():string[]{
  const errors:string[]=[];
  const allIds=[...courses,...blocks,...topics].map(item=>item.id);
  if(new Set(allIds).size!==allIds.length) errors.push("Course, Block and Topic IDs must be unique.");
  const courseIds=new Set(courses.map(item=>item.id));
  for(const block of blocks) if(!courseIds.has(block.courseId)) errors.push(`Block ${block.id} references a missing Course.`);
  const blockIds=new Set(blocks.map(item=>item.id));
  for(const topic of topics) if(!blockIds.has(topic.blockId)) errors.push(`Topic ${topic.id} references a missing Block.`);
  return errors;
}
