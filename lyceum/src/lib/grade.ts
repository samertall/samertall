export const PASS_RATIO = 0.7;

export type GradeQuestion = {
  id: string;
  correctChoiceId: string;
};

export type GradeAnswer = {
  questionId: string;
  choiceId: string;
};

export type GradeDetail = {
  questionId: string;
  choiceId: string | null;
  correct: boolean;
};

export function passed(score: number, total: number) {
  return total > 0 && score / total >= PASS_RATIO;
}

export function scoreAttempt(questions: GradeQuestion[], answers: GradeAnswer[]) {
  const chosen = new Map<string, string>();
  for (const answer of answers) {
    if (!chosen.has(answer.questionId)) chosen.set(answer.questionId, answer.choiceId);
  }
  let score = 0;
  const detail: GradeDetail[] = questions.map((question) => {
    const choiceId = chosen.get(question.id) ?? null;
    const correct = choiceId !== null && choiceId === question.correctChoiceId;
    if (correct) score += 1;
    return { questionId: question.id, choiceId, correct };
  });
  const total = questions.length;
  return { score, total, passed: passed(score, total), detail };
}

export function progressOf(done: number, total: number) {
  const safeDone = Math.max(0, Math.min(done, total));
  const percent = total === 0 ? 0 : Math.round((safeDone / total) * 100);
  return {
    done: safeDone,
    total,
    percent,
    complete: total > 0 && safeDone === total,
  };
}

export function formatMinutes(minutes: number) {
  const value = Math.max(0, Math.round(minutes));
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  if (rest === 0) return hours === 1 ? "1 hr" : `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function shuffleBy<T>(items: T[], seed: string) {
  const copy = items.slice();
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  for (let index = copy.length - 1; index > 0; index -= 1) {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    const swapIndex = Math.abs(hash) % (index + 1);
    const current = copy[index] as T;
    copy[index] = copy[swapIndex] as T;
    copy[swapIndex] = current;
  }
  return copy;
}

export function formatWhen(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
