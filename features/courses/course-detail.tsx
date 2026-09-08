"use client";
import Link from "next/link";
import { ArrowRight,CheckCircle2,Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card,CardDescription,CardTitle } from "@/components/ui/card";
import { courses } from "@/lib/content/catalog";
import { canonicalBlock,canonicalTopics as topics } from "@/lib/content/foundation";
const blocks=[canonicalBlock];
import { useProgress } from "@/features/progress/use-progress";
export function CourseDetail({courseId}:{courseId:string}){const {progress}=useProgress();const course=courses.find(item=>item.id===courseId)!;return <div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#35796b]">Fundamentos UAS</p><h1 className="mt-2 text-3xl font-bold">{course.title}</h1><div className="mt-8 space-y-5">{blocks.filter(block=>block.courseId===courseId).map(block=><section key={block.id}><h2 className="mb-3 text-xl font-bold">{block.title}</h2>{topics.filter(topic=>topic.blockId===block.id).map(topic=>{const item=progress[topic.id],done=item?.completionScore===100;return <Card key={topic.id} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex gap-3">{done?<CheckCircle2 className="mt-1 text-[#2e8b78]"/>:<Circle className="mt-1 text-[#72817d]"/>}<div><CardTitle>{topic.title}</CardTitle><CardDescription>{done?`En estudio · Mastery ${item.masteryScore}/100`:"Pendiente · nivel foundation"}</CardDescription></div></div><Button asChild><Link href={`/study/${topic.id}`}>{done?"Continuar":"Start Study"} <ArrowRight size={17}/></Link></Button></Card>;})}</section>)}</div></div>;}
