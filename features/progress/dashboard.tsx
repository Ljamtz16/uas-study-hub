"use client";
import { topicAction } from "@/lib/learning/activities";
import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Card,CardDescription,CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/content/catalog";
import { canonicalTopics as topics } from "@/lib/content/foundation";
import { recommendationConfig } from "@/lib/learning/config";
import { getNextStudyAction } from "@/lib/learning/recommendations";
import { useProgress } from "./use-progress";

export function Dashboard(){
  const {progress,evidence,sessions,hydrated}=useProgress();
  const studied=topics.filter(topic=>progress[topic.id]?.completionScore===100).length;
  const percent=Math.round(studied/topics.length*100);
  const next=getNextStudyAction({topics,progress:Object.values(progress),sessions},recommendationConfig);
  return <div className="space-y-8"><section><p className="text-sm font-bold uppercase tracking-[.18em] text-[#35796b]">Knowledge Foundation · V0.3.1</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Tu siguiente paso, claro y local.</h1><p className="mt-3 max-w-2xl text-[#52635f]">Estudia Fundamentos UAS y conserva evidencia, progreso y notas en este dispositivo.</p></section><section className="grid gap-5 md:grid-cols-[1.4fr_1fr]"><Card className="bg-[#173d37] text-white"><p className="text-sm font-semibold text-[#b9ddd3]">Next Study Action</p><CardTitle className="mt-3 text-2xl text-white">{next?topics.find(topic=>topic.id===next.topicId)?.title:"Topic completado"}</CardTitle><CardDescription className="text-[#d1e6e0]">{next?.reasonText??"No hay otra acción pendiente en esta vertical slice."}</CardDescription>{next&&<p className="mt-3">{topicAction(progress[next.topicId],evidence.filter(item=>item.topicId===next.topicId),false).label}: {topicAction(progress[next.topicId],evidence.filter(item=>item.topicId===next.topicId)).reason}</p>}{next&&<Button asChild className="mt-6 bg-white text-[#173d37] hover:bg-[#e8f1ee]"><Link href={`/study/${next.topicId}`}>Start Study <ArrowRight size={17}/></Link></Button>}</Card><Card><BookOpenCheck className="text-[#35796b]"/><CardTitle className="mt-4">Progreso de Fundamentos</CardTitle><p className="mt-3 text-4xl font-bold" data-testid="course-progress">{hydrated?`${percent}%`:"—"}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9efed]"><div className="h-full bg-[#2e8b78] transition-all" style={{width:`${percent}%`}}/></div><CardDescription>{studied} de {topics.length} Topics estudiados</CardDescription></Card></section><section><h2 className="text-xl font-bold">Courses</h2><Card className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><CardTitle>{courses[0].title}</CardTitle><CardDescription>4 bloques · 19 Topics disponibles</CardDescription></div><Button asChild variant="outline"><Link href={`/courses/${courses[0].id}`}>Abrir curso <ArrowRight size={17}/></Link></Button></Card></section></div>;
}
