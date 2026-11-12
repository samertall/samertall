import { submitQuizAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/widgets";
import type { PublicQuestion, ReviewQuestion } from "@/server/read";

export function QuizForm({ lessonId, questions }: { lessonId: string; questions: PublicQuestion[] }) {
  return (
    <ActionForm action={submitQuizAction} className="quiz">
      <input type="hidden" name="lessonId" value={lessonId} />
      <p className="muted">70% or better completes the lesson. The answers stay on the server until you submit.</p>
      {questions.map((question, index) => (
        <fieldset key={question.id}>
          <legend>
            {index + 1}. {question.prompt}
          </legend>
          {question.choices.map((choice) => (
            <label key={choice.id} className="choice">
              <input type="radio" name={`q_${question.id}`} value={choice.id} required />
              <span>{choice.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <SubmitButton variant="brass" pending="Scoring…">
        Submit answers
      </SubmitButton>
    </ActionForm>
  );
}

export function QuizReview({ questions }: { questions: ReviewQuestion[] }) {
  return (
    <div className="stack">
      {questions.map((question, index) => (
        <fieldset key={question.id}>
          <legend>
            {index + 1}. {question.prompt}
          </legend>
          {question.choices.map((choice) => {
            const state = choice.selected && choice.correct ? "right" : choice.selected && !choice.correct ? "wrong" : choice.correct ? "right" : "";
            return (
              <p key={choice.id} className={`choice ${state}`}>
                <span>
                  {choice.label}
                  {choice.selected ? " · Your answer" : ""}
                  {choice.correct ? " · Correct" : ""}
                </span>
              </p>
            );
          })}
          <p className="muted">{question.explanation}</p>
        </fieldset>
      ))}
    </div>
  );
}
