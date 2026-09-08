import {describe,it,expect} from "vitest";
import fs from "node:fs";
import matter from "gray-matter";
import {graphNodes,graphEdges,validateGraph,topicGraphState} from "@/lib/content/knowledge-graph";
import {topics,concepts,blocks} from "@/lib/content/catalog";
import {academicRecords,canonicalTopics,canonicalBlock,isLegacyTopic} from "@/lib/content/foundation";
describe("V0.3 knowledge foundation",()=>{
 it("KG-02 every graph Topic resolves",()=>{expect(validateGraph()).toEqual([]);expect(graphNodes.filter(n=>n.kind==="topic")).toHaveLength(8);for(const n of graphNodes)expect(topics.some(t=>t.id===n.topicId)).toBe(true);});
 it("KG-03 edges and prerequisite references are valid and traced",()=>{for(const edge of graphEdges){expect(graphNodes.some(n=>n.id===edge.sourceId)).toBe(true);expect(graphNodes.some(n=>n.id===edge.targetId)).toBe(true);expect(edge.provenance).toBe("derived_from_curriculum");expect(edge.rationale.length).toBeGreaterThan(20);}for(const t of academicRecords)for(const id of t.prerequisite_concept_ids)expect(concepts.some(c=>c.id===id)).toBe(true);});
 it("invalid references and missing provenance fail validation",()=>{expect(validateGraph([{...graphNodes[0],topicId:"missing"}],[]).length).toBeGreaterThan(0);expect(validateGraph(graphNodes,[{...graphEdges[0],targetId:"missing"}]).length).toBeGreaterThan(0);expect(validateGraph(graphNodes,[{...graphEdges[0],provenance:""}]).length).toBeGreaterThan(0);});
 it("KG-06 absent progress remains pending without Concept mastery",()=>{expect(topicGraphState()).toEqual({score:0,status:"pending"});expect(graphNodes.filter(n=>n.kind==="concept").every(n=>!("masteryScore" in n))).toBe(true);});
 it("KG-07 legacy IDs and routes remain outside canonical navigation",()=>{expect(topics.find(t=>t.id==="fund-radio-links-intro")?.blockId).toBe("intro-radio-links");expect(blocks.some(b=>b.id==="intro-radio-links")).toBe(true);expect(canonicalBlock.id).toBe("fundamentals-block-01");expect(canonicalTopics).toHaveLength(8);expect(canonicalTopics.some(t=>isLegacyTopic(t.id))).toBe(false);});
 it("each academic page has historical provenance, valid concepts and adapted objectives",()=>{for(const record of academicRecords){expect(record.source.academic_year).toBe("2023/2024");expect(record.source.validation_status).toBe("official_historical_reference");expect(record.objective_kind).toBe("pedagogical_adaptation");for(const id of record.concept_ids)expect(concepts.some(c=>c.id===id)).toBe(true);const mdx=matter(fs.readFileSync(record.content_ref,"utf8"));expect(mdx.data.stable_id).toBe(record.stable_id);expect(mdx.content).toContain("Desarrollo técnico pendiente");}});
});
