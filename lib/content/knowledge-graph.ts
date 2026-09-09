import data from "@/content/courses/fundamentals-uas/knowledge-map.v0.3.1.json";
import { topics } from "./catalog";
import { academicSources } from "./foundation";
import type { RelationType, TopicProgress } from "@/lib/learning/types";
export interface GraphNode {id:string;kind:string;title:string;topicId:string;status?:string}
export interface GraphEdge {id:string;sourceId:string;targetId:string;relationType:string;provenance:string;sourceRef:string;source_pages?:number[];rationale:string}
export const graphNodes:GraphNode[]=data.nodes;
export const graphEdges:GraphEdge[]=data.edges;
const relationTypes:RelationType[]=["prerequisite_of","part_of","used_by","applies_to","related_to","measured_by"];
export function validateGraph(nodes:GraphNode[]=graphNodes,edges:GraphEdge[]=graphEdges):string[]{
  const errors:string[]=[],ids=new Set(nodes.map(n=>n.id));
  if(ids.size!==nodes.length)errors.push("Duplicate graph node ID");
  if(new Set(edges.map(e=>e.id)).size!==edges.length)errors.push("Duplicate graph edge ID");
  for(const node of nodes){if(!topics.some(t=>t.id===node.topicId))errors.push(`Invalid Topic reference: ${node.id}`);if(!["topic","concept"].includes(node.kind))errors.push(`Invalid node kind: ${node.id}`);}
  for(const edge of edges){if(!ids.has(edge.sourceId)||!ids.has(edge.targetId))errors.push(`Invalid edge reference: ${edge.id}`);if(!relationTypes.includes(edge.relationType as RelationType))errors.push(`Invalid relation type: ${edge.id}`);if(edge.provenance!=="derived_from_curriculum"||!academicSources.some(source=>source.id===edge.sourceRef)||!edge.rationale.trim())errors.push(`Missing relation provenance: ${edge.id}`);}
  return errors;
}
export function topicGraphState(progress?:TopicProgress){return {score:progress?.masteryScore??0,status:progress?.status??"pending"};}
