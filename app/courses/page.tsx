import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card,CardDescription,CardTitle } from "@/components/ui/card";
import { courses } from "@/lib/content/catalog";
export default function CoursesPage(){return <div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#35796b]">Courses</p><h1 className="mt-2 text-3xl font-bold">Contenido disponible</h1><div className="mt-7">{courses.map(course=><Card key={course.id} className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><CardTitle>{course.title}</CardTitle><CardDescription>{course.description}</CardDescription></div><Button asChild><Link href={`/courses/${course.id}`}>Ver curso <ArrowRight size={17}/></Link></Button></Card>)}</div></div>;}
