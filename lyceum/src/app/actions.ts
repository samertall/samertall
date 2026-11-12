"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/form-state";
import { field, isSlug } from "@/lib/text";
import { answersFromForm, completeReading, setEnrollment, submitQuiz } from "@/server/learn";
import { refresh } from "@/server/refresh";
import {
  addLesson,
  addModule,
  addQuestion,
  createCourse,
  deleteCourse,
  deleteLesson,
  deleteModule,
  deleteQuestion,
  moveLesson,
  moveModule,
  renameModule,
  setPublished,
  updateCourse,
  updateLesson,
} from "@/server/teach";
import { readViewer } from "@/server/viewer";

async function personOrRedirect() {
  const viewer = await readViewer();
  if (viewer.kind !== "person") redirect("/?notice=sign-in");
  return viewer;
}

function coursePath(slug: string) {
  return isSlug(slug) ? `/courses/${slug}` : "/";
}

export async function enrollAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const intent = formData.get("intent") === "leave" ? "leave" : "enroll";
  const result = await setEnrollment(person.id, slug, intent);
  if (!result.ok) redirect(`${coursePath(slug)}?notice=${result.code}`);
  refresh();
  if (intent === "leave") redirect("/study");
  if (result.nextLessonId) redirect(`/learn/${result.slug}/${result.nextLessonId}`);
  redirect(coursePath(result.slug));
}

export async function completeReadingAction(formData: FormData) {
  const person = await personOrRedirect();
  const result = await completeReading(person.id, field(formData, "lessonId"));
  if (!result.ok) {
    const slug = field(formData, "slug");
    redirect(`${coursePath(slug)}?notice=${result.code}`);
  }
  refresh();
  if (result.nextLessonId) redirect(`/learn/${result.slug}/${result.nextLessonId}`);
  redirect(`/courses/${result.slug}`);
}

export async function submitQuizAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const result = await submitQuiz(person.id, field(formData, "lessonId"), answersFromForm(formData));
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/learn/${result.slug}/${result.lessonId}`);
}

export async function createCourseAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const result = await createCourse(person.id, {
    title: field(formData, "title"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    subject: field(formData, "subject"),
    level: field(formData, "level"),
  });
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${result.slug}`);
}

export async function updateCourseAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await updateCourse(person.id, slug, {
    title: field(formData, "title"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    subject: field(formData, "subject"),
    level: field(formData, "level"),
  });
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function publishAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await setPublished(person.id, slug, field(formData, "published") === "true");
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function deleteCourseAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  if (formData.get("confirm") !== "yes") return { error: "Confirm that you want to delete the course." };
  const slug = field(formData, "slug");
  const result = await deleteCourse(person.id, slug);
  if (!result.ok) return { error: result.error };
  refresh();
  redirect("/teach");
}

export async function addModuleAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await addModule(person.id, slug, field(formData, "title"));
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function renameModuleAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await renameModule(person.id, slug, field(formData, "moduleId"), field(formData, "title"));
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function deleteModuleAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await deleteModule(person.id, slug, field(formData, "moduleId"));
  if (result.ok) refresh();
  redirect(`/teach/${isSlug(slug) ? slug : ""}?notice=${result.ok ? "saved" : result.code}`);
}

export async function moveModuleAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveModule(person.id, slug, field(formData, "moduleId"), direction);
  refresh();
  redirect(`/teach/${slug}`);
}

export async function addLessonAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await addLesson(person.id, slug, field(formData, "moduleId"), {
    title: field(formData, "title"),
    kind: field(formData, "kind"),
    minutes: field(formData, "minutes"),
  });
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function updateLessonAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await updateLesson(person.id, slug, field(formData, "lessonId"), {
    title: field(formData, "title"),
    minutes: field(formData, "minutes"),
    body: field(formData, "body"),
  });
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function deleteLessonAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  await deleteLesson(person.id, slug, field(formData, "lessonId"));
  refresh();
  redirect(`/teach/${slug}`);
}

export async function moveLessonAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveLesson(person.id, slug, field(formData, "lessonId"), direction);
  refresh();
  redirect(`/teach/${slug}`);
}

export async function addQuestionAction(_state: FormState, formData: FormData): Promise<FormState> {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  const result = await addQuestion(person.id, slug, field(formData, "lessonId"), {
    prompt: field(formData, "prompt"),
    explanation: field(formData, "explanation"),
    labels: [0, 1, 2, 3].map((index) => field(formData, `choice${index}`)),
    correctIndex: field(formData, "correct"),
  });
  if (!result.ok) return { error: result.error };
  refresh();
  redirect(`/teach/${slug}`);
}

export async function deleteQuestionAction(formData: FormData) {
  const person = await personOrRedirect();
  const slug = field(formData, "slug");
  await deleteQuestion(person.id, slug, field(formData, "questionId"));
  refresh();
  redirect(`/teach/${slug}`);
}
