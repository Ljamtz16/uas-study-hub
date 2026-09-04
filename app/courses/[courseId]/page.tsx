import { notFound } from "next/navigation";
import { CourseDetail } from "@/features/courses/course-detail";
import { courses } from "@/lib/content/catalog";
export function generateStaticParams(){return courses.map(course=>({courseId:course.id}));}
export default async function CoursePage({params}:{params:Promise<{courseId:string}>}){const {courseId}=await params;if(!courses.some(course=>course.id===courseId))notFound();return <CourseDetail courseId={courseId}/>;}
