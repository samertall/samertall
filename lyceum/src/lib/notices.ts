export const NOTICES = {
  "sign-in": "Sign in to continue.",
  enroll: "Enroll before opening a lesson.",
  answers: "Answer every question before submitting.",
  "quiz-empty": "This quiz does not have questions yet.",
  "need-lesson": "Add a lesson before publishing.",
  "need-question": "Add a question to each quiz before publishing.",
  forbidden: "You can only edit a course you author.",
  missing: "That course or lesson is not available.",
  invalid: "Check the form and try again.",
  "title-required": "Add a title.",
  "title-long": "Keep the title to 100 characters or fewer.",
  "summary-required": "Add a one-line summary.",
  "summary-long": "Keep the summary to 240 characters or fewer.",
  "description-required": "Add a description.",
  "description-long": "Keep the description to 4,000 characters or fewer.",
  "subject-required": "Name a subject.",
  "subject-long": "Keep the subject to 40 characters or fewer.",
  "subject-chars": "Use letters, numbers, and simple punctuation for the subject.",
  level: "Choose Foundation, Practice, or Advanced.",
  "module-required": "Name the module.",
  "module-long": "Keep the module title to 120 characters or fewer.",
  "lesson-required": "Name the lesson.",
  "lesson-long": "Keep the lesson title to 120 characters or fewer.",
  "body-long": "Keep the lesson under 12,000 characters.",
  minutes: "Set the reading time between 1 and 180 minutes.",
  "question-required": "Write the question.",
  "question-long": "Keep the question to 400 characters or fewer.",
  "explanation-long": "Keep the explanation to 600 characters or fewer.",
  "choice-short": "Add at least two answers.",
  "choice-long": "Keep each answer to 200 characters or fewer.",
  "choice-correct": "Mark which answer is correct.",
  "too-many-modules": "This course already has 40 modules.",
  "too-many-lessons": "This module already has 30 lessons.",
  "too-many-questions": "This quiz already has 20 questions.",
  "confirm-delete": "Confirm that you want to delete the course.",
  kind: "Choose a reading or a quiz.",
  saved: "Saved.",
} as const;

export type NoticeCode = keyof typeof NOTICES;

export function noticeText(code: string | undefined | null) {
  if (!code || !(code in NOTICES)) return null;
  return NOTICES[code as NoticeCode];
}
