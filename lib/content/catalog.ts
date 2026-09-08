import graph from "@/content/courses/fundamentals-uas/knowledge-map.v0.3.json";
import { canonicalBlock, canonicalTopics, canonicalObjectives } from "./foundation";
import type { Block, Concept, Course, LearningObjective, Skill, Topic } from "@/lib/learning/types";

export const FUNDAMENTALS_COURSE_ID = "fundamentals-uas";
export const RADIO_BLOCK_ID = "intro-radio-links";
export const RADIO_TOPIC_ID = "fund-radio-links-intro";

export const courses:Course[]=[{id:FUNDAMENTALS_COURSE_ID,title:"Fundamentos de Sistemas Aéreos No Tripulados",order:1,description:"Golden Course de UAS Study Hub."}];
const legacyBlocks:Block[]=[{id:RADIO_BLOCK_ID,courseId:FUNDAMENTALS_COURSE_ID,title:"I · Introducción y radioenlaces",order:1}];
const legacyTopics:Topic[]=[{id:RADIO_TOPIC_ID,blockId:RADIO_BLOCK_ID,title:"Radioenlaces en sistemas UAS",difficulty:"foundation",order:1,contentRef:"content/courses/fundamentals-uas/topics/golden-topic.radioenlaces.v0.1.mdx",objectiveIds:["obj-radio-001","obj-radio-002","obj-radio-003"],conceptIds:["radio-command-control","radio-video-link","radio-telemetry","radio-ground-station","radio-receiver","radio-tx-rx","radio-antenna"],skillIds:["skill-identify-radio-link-elements","skill-distinguish-command-video-telemetry","skill-explain-radio-link-chain"],prerequisiteTopicIds:[],relatedTopicIds:[]}];

const legacyConcepts:Concept[]=legacyTopics[0].conceptIds.map((id,index)=>({id,title:["Mando/control","Vídeo","Telemetría","Estación","Receptor","TX/RX","Antena"][index],primaryTopicId:RADIO_TOPIC_ID}));
export const skills:Skill[]=[
  {id:"skill-identify-radio-link-elements",title:"Identificar elementos del radioenlace",description:"Evidencia esperada: recall/quiz.",requiredConceptIds:legacyTopics[0].conceptIds,primaryTopicId:RADIO_TOPIC_ID},
  {id:"skill-distinguish-command-video-telemetry",title:"Distinguir mando/control, vídeo y telemetría",description:"Evidencia esperada: recall/quiz.",requiredConceptIds:["radio-command-control","radio-video-link","radio-telemetry"],primaryTopicId:RADIO_TOPIC_ID},
  {id:"skill-explain-radio-link-chain",title:"Explicar la relación entre los elementos",description:"Evidencia esperada: respuesta corta / ejercicio.",requiredConceptIds:["radio-ground-station","radio-receiver","radio-tx-rx","radio-antenna"],primaryTopicId:RADIO_TOPIC_ID},
];
const legacyObjectives:LearningObjective[]=[
  {id:"obj-radio-001",topicId:RADIO_TOPIC_ID,text:"Identificar los elementos principales que aparecen en el bloque de radioenlaces del curso.",conceptIds:legacyTopics[0].conceptIds,skillIds:[skills[0].id]},
  {id:"obj-radio-002",topicId:RADIO_TOPIC_ID,text:"Distinguir mando/control, vídeo y telemetría dentro del alcance definido por el material oficial.",conceptIds:["radio-command-control","radio-video-link","radio-telemetry"],skillIds:[skills[1].id]},
  {id:"obj-radio-003",topicId:RADIO_TOPIC_ID,text:"Explicar, al nivel exigido por la asignatura, cómo se relacionan TX/RX, receptor, antena y estación.",conceptIds:["radio-ground-station","radio-receiver","radio-tx-rx","radio-antenna"],skillIds:[skills[2].id]},
];
export const blocks:Block[]=[canonicalBlock,...legacyBlocks];
export const topics:Topic[]=[...canonicalTopics,...legacyTopics];
export const objectives:LearningObjective[]=[...canonicalObjectives,...legacyObjectives];
export const concepts:Concept[]=[...legacyConcepts,...graph.nodes.filter(node=>node.kind==="concept"&&!legacyConcepts.some(c=>c.id===node.id)).map(node=>({id:node.id,title:node.title,primaryTopicId:node.topicId}))];
