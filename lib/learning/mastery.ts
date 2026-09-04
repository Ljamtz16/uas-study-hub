import type { EvidenceType, LearningEvidence, MasteryBreakdown, MasteryConfig, TopicProgress } from "./types";

const scoredTypes:EvidenceType[]=["study","recall","quiz","review","application"];

function aggregate(entries:LearningEvidence[]):number{
  const scores=[...entries].sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)).slice(0,3).map(item=>item.normalizedScore);
  if(scores.length===0)return 0;
  if(scores.length===1)return scores[0];
  if(scores.length===2)return scores[0]*.7+scores[1]*.3;
  return scores[0]*.6+scores[1]*.3+scores[2]*.1;
}

function successfulSpacedReviews(entries:LearningEvidence[],config:MasteryConfig):number{
  const successful=entries.filter(item=>item.type==="review"&&item.normalizedScore>=config.understoodEvidenceThreshold).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));
  let count=0,last:number|undefined;
  for(const item of successful){const time=Date.parse(item.occurredAt);if(last===undefined||time-last>=config.minReviewSeparationHours*3_600_000){count++;last=time;}}
  return count;
}

export function calculateTopicMastery(topicId:string,evidence:LearningEvidence[],config:MasteryConfig,previous?:TopicProgress):TopicProgress{
  const relevant=evidence.filter(item=>item.topicId===topicId);
  const breakdown=Object.fromEntries(scoredTypes.map(type=>[type,type==="study"?(relevant.some(item=>item.type==="study")?1:0):aggregate(relevant.filter(item=>item.type===type))])) as unknown as MasteryBreakdown;
  const masteryScore=Math.round(scoredTypes.reduce((total,type)=>total+breakdown[type]*config.weights[type],0));
  const latest=[...relevant].sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))[0];
  const latestRecallOrQuiz=[...relevant].filter(item=>item.type==="recall"||item.type==="quiz").sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))[0];
  const weakRecent=latestRecallOrQuiz&&latestRecallOrQuiz.normalizedScore<config.weakAttemptThreshold;
  const overdue=previous?.reviewDueAt&&Date.parse(previous.reviewDueAt)<Date.now()&&(previous.status==="understood"||previous.status==="mastered");
  let status:TopicProgress["status"]="pending";
  if(relevant.length&&masteryScore>=10)status="studying";
  if(masteryScore>=config.understoodScore&&(breakdown.recall>=config.understoodEvidenceThreshold||breakdown.quiz>=config.understoodEvidenceThreshold))status="understood";
  if(masteryScore>=config.masteredScore&&(breakdown.recall>=config.understoodEvidenceThreshold||breakdown.quiz>=config.understoodEvidenceThreshold)&&successfulSpacedReviews(relevant,config)>=config.minSuccessfulSpacedReviewsForMastery)status="mastered";
  if(weakRecent||overdue)status="reinforce";
  const now=new Date().toISOString();
  const studied=[...relevant].filter(item=>item.type==="study").sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))[0];
  return {topicId,status,masteryScore,completionScore:breakdown.study*100,breakdown,lastStudiedAt:studied?.occurredAt,lastEvidenceAt:latest?.occurredAt,reviewDueAt:previous?.reviewDueAt,reinforceReason:weakRecent?"La evidencia reciente de recuperación está por debajo del umbral.":overdue?"Hay un repaso vencido.":undefined,updatedAt:now};
}
