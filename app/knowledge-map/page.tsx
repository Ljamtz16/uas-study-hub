import {KnowledgeMap} from "@/features/knowledge/knowledge-map";
import {validateGraph} from "@/lib/content/knowledge-graph";
export default function KnowledgeMapPage(){const errors=validateGraph();if(errors.length)throw new Error(errors.join("; "));return <KnowledgeMap/>;}
