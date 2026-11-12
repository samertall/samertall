import { curriculum, samplePeople, sampleWork, type SeedLesson, type SeedQuestion } from "@/server/curriculum";

type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

function lessonMap() {
  const lessons = new Map<string, SeedLesson>();
  for (const course of curriculum) {
    for (const section of course.modules) {
      for (const lesson of section.lessons) lessons.set(lesson.id, lesson);
    }
  }
  return lessons;
}

function choiceId(question: SeedQuestion, index: number) {
  return `${question.id}:${index}`;
}

function answersFor(lesson: SeedLesson, correctCount: number) {
  const questions = lesson.questions ?? [];
  return questions.map((question, index) => {
    const correctIndex = Math.max(0, question.choices.findIndex((choice) => choice.correct));
    const wrongIndex = Math.max(0, question.choices.findIndex((choice) => !choice.correct));
    const picked = index < correctCount ? correctIndex : wrongIndex;
    return { questionId: question.id, choiceId: choiceId(question, picked) };
  });
}

export async function insertCurriculum(query: Query) {
  await query(
    "insert into people (id, name, email, sample) values ($1, $2, $3, false)",
    ["faculty", "Lyceum Faculty", ""],
  );
  for (const person of samplePeople) {
    await query(
      "insert into people (id, name, email, sample) values ($1, $2, $3, true)",
      [person.id, person.name, person.email],
    );
  }

  for (const course of curriculum) {
    await query(
      `insert into courses (id, slug, title, summary, description, subject, level, published, house, author_id)
       values ($1, $2, $3, $4, $5, $6, $7, true, true, $8)`,
      [course.id, course.slug, course.title, course.summary, course.description, course.subject, course.level, "faculty"],
    );
    for (const [moduleIndex, section] of course.modules.entries()) {
      await query(
        "insert into modules (id, course_id, title, position) values ($1, $2, $3, $4)",
        [section.id, course.id, section.title, moduleIndex],
      );
      for (const [lessonIndex, lesson] of section.lessons.entries()) {
        await query(
          "insert into lessons (id, module_id, title, kind, body, minutes, position) values ($1, $2, $3, $4, $5, $6, $7)",
          [lesson.id, section.id, lesson.title, lesson.kind, lesson.body, lesson.minutes, lessonIndex],
        );
        for (const [questionIndex, question] of (lesson.questions ?? []).entries()) {
          await query(
            "insert into questions (id, lesson_id, prompt, explanation, position) values ($1, $2, $3, $4, $5)",
            [question.id, lesson.id, question.prompt, question.explanation, questionIndex],
          );
          for (const [choiceIndex, choice] of question.choices.entries()) {
            await query(
              "insert into choices (id, question_id, label, correct, position) values ($1, $2, $3, $4, $5)",
              [choiceId(question, choiceIndex), question.id, choice.label, choice.correct, choiceIndex],
            );
          }
        }
      }
    }
  }

  const lessons = lessonMap();
  for (const [workIndex, work] of sampleWork.entries()) {
    await query(
      "insert into enrollments (person_id, course_id) values ($1, $2) on conflict do nothing",
      [work.personId, work.courseId],
    );
    for (const lessonId of work.done) {
      await query(
        "insert into lesson_progress (person_id, lesson_id) values ($1, $2) on conflict do nothing",
        [work.personId, lessonId],
      );
    }
    if (work.quiz) {
      const lesson = lessons.get(work.quiz.lessonId);
      if (!lesson) continue;
      const attemptId = `attempt_sample_${workIndex}`;
      const total = lesson.questions?.length ?? 0;
      await query(
        "insert into quiz_attempts (id, person_id, lesson_id, score, total) values ($1, $2, $3, $4, $5)",
        [attemptId, work.personId, work.quiz.lessonId, work.quiz.correct, total],
      );
      for (const answer of answersFor(lesson, work.quiz.correct)) {
        await query(
          "insert into attempt_answers (attempt_id, question_id, choice_id) values ($1, $2, $3)",
          [attemptId, answer.questionId, answer.choiceId],
        );
      }
    }
  }
}
