import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TopicActions } from "@/features/study/topic-actions";
import { objectives,topics } from "@/lib/content/catalog";
export function generateStaticParams(){return topics.map(topic=>({topicId:topic.id}));}
export default async function TopicPage({params}:{params:Promise<{topicId:string}>}){const {topicId}=await params;const topic=topics.find(item=>item.id===topicId);if(!topic)notFound();const source=await fs.readFile(path.join(process.cwd(),topic.contentRef),"utf8");const {content}=matter(source);return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"><article><p className="text-sm font-bold uppercase tracking-[.18em] text-[#35796b]">Fundamentos UAS · Bloque I</p><h1 className="mt-2 text-3xl font-bold">{topic.title}</h1><p className="mt-2 text-sm text-[#52635f]">Dificultad: {topic.difficulty} · Prerrequisitos: ninguno declarado</p><section className="mt-7 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Learning objectives</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-[#33443f]">{objectives.map(objective=><li key={objective.id}>{objective.text}</li>)}</ul></section><div className="prose mt-6 rounded-2xl border bg-white p-6"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></div></article><aside><TopicActions topicId={topic.id}/></aside></div>;}
