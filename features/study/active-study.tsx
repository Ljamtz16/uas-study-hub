"use client";
import { useState } from "react";
import { activities, topicAction } from "@/lib/learning/activities";
import { saveActivity } from "@/lib/db/repositories/learning";
import { useProgress } from "@/features/progress/use-progress";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

export function ActiveStudy({topicId}:{topicId:string}) {
  const {progress,evidence,load,hydrated}=useProgress();
  const [response,setResponse]=useState("");
  const [answers,setAnswers]=useState<number[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState<Awaited<ReturnType<typeof saveActivity>>>();
  const [finished,setFinished]=useState(false);
  const own=evidence.filter(item=>item.topicId===topicId);
  const action=topicAction(progress[topicId],own);
  async function submit(attempt:Parameters<typeof saveActivity>[1]) {
    setBusy(true);setError("");
    try {const saved=await saveActivity(topicId,attempt);setResult(saved);if(attempt.type==="quiz")setFinished(true);await load();}
    catch {setError("No se pudo guardar el intento. Tu respuesta sigue disponible; vuelve a intentarlo.");}
    finally {setBusy(false);}
  }
  if(topicId!==activities.topicId)return null;
  return <div className="space-y-4">
    <Card><p className="text-sm">{activities.notice}</p><p className="mt-3" data-testid="evidence-completed">Evidencia completada: {(["study","recall","quiz"] as const).map(type=>`${type}: ${own.filter(item=>item.type===type).length}`).join(" · ")}</p><p className="mt-3">Next Study Action: <a href={`#${action.anchor}`} className="underline">{action.label}</a></p><p>{action.reason}</p></Card>
    <Card id="recall"><CardTitle>Active Recall</CardTitle><p className="mt-3">{activities.recall.prompt}</p><label htmlFor="recall-response" className="mt-3 block">Respuesta local (opcional)</label><textarea id="recall-response" className="w-full rounded border p-2" value={response} onChange={e=>setResponse(e.target.value)}/><div className="mt-3 flex flex-wrap gap-2">{([{label:"No lo recordé",score:0},{label:"Parcialmente",score:.5},{label:"Lo recordé",score:1}] as const).map(rating=><Button key={rating.score} disabled={busy||!hydrated} onClick={()=>void submit({type:"recall",score:rating.score,response})}>{rating.label}</Button>)}</div></Card>
    <Card id="quiz"><CardTitle>Quiz local</CardTitle><fieldset disabled={busy||finished||!hydrated}>{activities.questions.map((question,i)=><fieldset key={question.id} className="mt-4"><legend>{question.prompt}</legend>{question.options.map((option,j)=><label className="mt-2 block" key={option}><input type="radio" name={question.id} checked={answers[i]===j} onChange={()=>setAnswers(old=>{const next=[...old];next[i]=j;return next;})}/> {option}</label>)}</fieldset>)}</fieldset><Button className="mt-4" disabled={busy||finished||!hydrated||activities.questions.some((_,i)=>answers[i]===undefined)} onClick={()=>void submit({type:"quiz",answers})}>Finalizar Quiz</Button>{finished&&<Button variant="outline" className="mt-3" onClick={()=>{setFinished(false);setAnswers([]);}}>Nuevo intento</Button>}</Card>
    {error&&<p role="alert">{error}</p>}
    {result&&<Card role="status"><CardTitle>Resultado · {result.evidence.type}</CardTitle><p>Score obtenido: {result.evidence.normalizedScore} / 1</p><p>Mastery anterior: {result.before.masteryScore}/100</p><p>Mastery nuevo: {result.progress.masteryScore}/100</p><p>Status nuevo: {result.progress.status}</p><p>Next Study Action: {action.label}</p><p>{action.reason}</p><p className="mt-2 text-sm">Resultado de placeholder; no acredita conocimiento técnico.</p></Card>}
  </div>;
}
