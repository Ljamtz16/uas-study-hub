import content from "@/content/courses/fundamentals-uas/topics/radioenlaces.activities.v0.2.json";
import type { LearningEvidence, TopicProgress } from "./types";

export const activities = content;
export function quizScore(answers: number[]): number {
  if (answers.length !== content.questions.length || content.questions.some((question, i) => !Number.isInteger(answers[i]) || answers[i] < 0 || answers[i] >= question.options.length)) throw new Error("Responde todas las preguntas.");
  return answers.filter((answer, i) => answer === content.questions[i].correctIndex).length / content.questions.length;
}
export function topicAction(progress?: TopicProgress, evidence: LearningEvidence[] = []) {
  if (!progress?.completionScore) return { label: "Study", reason: "Trabaja el contenido y guarda evidencia de Study.", anchor: "study" };
  if (!evidence.some(item => item.type === "recall")) return { label: "Active Recall", reason: "Ya estudiaste el tema; falta recuperar lo aprendido sin mirar.", anchor: "recall" };
  if (!evidence.some(item => item.type === "quiz")) return { label: "Quiz", reason: "Ya registraste Recall; completa el quiz local.", anchor: "quiz" };
  return { label: "Continuar el tema", reason: progress.status === "reinforce" ? "La evidencia reciente indica que necesitas reforzar el tema; vuelve a Study y repite Recall o Quiz." : "Recall y Quiz registrados. Continúa con material oficial; el dominio requiere repasos espaciados.", anchor: "study" };
}
