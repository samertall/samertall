import Link from "next/link";
import {
  addLessonAction,
  addModuleAction,
  addQuestionAction,
  deleteCourseAction,
  deleteLessonAction,
  deleteModuleAction,
  deleteQuestionAction,
  moveLessonAction,
  moveModuleAction,
  publishAction,
  renameModuleAction,
  updateCourseAction,
  updateLessonAction,
} from "@/app/actions";
import { AreaField, LevelField, SubjectField, TextField } from "@/components/fields";
import { Meter } from "@/components/meter";
import { ActionForm, SubmitButton } from "@/components/widgets";
import { progressOf } from "@/lib/grade";
import type { loadStudio } from "@/server/teach";

type Studio = NonNullable<Awaited<ReturnType<typeof loadStudio>>>;

export function StudioEditor({ studio }: { studio: Studio }) {
  return (
    <div className="stack">
      <div className="row">
        <Link href="/teach">All courses</Link>
        {studio.published ? <Link href={`/courses/${studio.slug}`}>View in the catalog</Link> : <span className="pill">Draft</span>}
      </div>
      <header className="hero">
        <p className="kicker">Studio · /courses/{studio.slug}</p>
        <h1>{studio.title}</h1>
      </header>
      <div className="split">
        <ActionForm action={updateCourseAction} className="sheet stack">
          <h2>Course</h2>
          <input type="hidden" name="slug" value={studio.slug} />
          <TextField label="Title" name="title" defaultValue={studio.title} required maxLength={100} />
          <TextField label="Summary" name="summary" defaultValue={studio.summary} required maxLength={240} />
          <SubjectField value={studio.subject} />
          <LevelField value={studio.level} />
          <AreaField label="Description" name="description" defaultValue={studio.description} required maxLength={4000} rows={8} />
          <SubmitButton pending="Saving…">Save course</SubmitButton>
        </ActionForm>
        <div className="panel">
          <h2>Catalog</h2>
          <p className="muted">{studio.published ? "Published. Learners can enroll." : "A draft stays off the catalog."}</p>
          <ActionForm action={publishAction}>
            <input type="hidden" name="slug" value={studio.slug} />
            <input type="hidden" name="published" value={studio.published ? "false" : "true"} />
            <SubmitButton variant="brass">{studio.published ? "Unpublish" : "Publish"}</SubmitButton>
          </ActionForm>
        </div>
      </div>

      <section className="stack">
        <h2>Outline</h2>
        {studio.modules.length === 0 ? <p className="muted">Add a module, then a reading or a quiz.</p> : null}
        {studio.modules.map((module, moduleIndex) => (
          <details key={module.id} className="sheet" open={moduleIndex === 0}>
            <summary>{module.title}</summary>
            <div className="stack" style={{ marginTop: 14 }}>
              <ActionForm action={renameModuleAction} className="row">
                <input type="hidden" name="slug" value={studio.slug} />
                <input type="hidden" name="moduleId" value={module.id} />
                <TextField label="Module title" name="title" defaultValue={module.title} required maxLength={120} />
                <SubmitButton variant="ghost" pending="Saving…">Rename</SubmitButton>
              </ActionForm>
              <div className="row">
                {moduleIndex > 0 ? (
                  <form action={moveModuleAction}>
                    <input type="hidden" name="slug" value={studio.slug} />
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input type="hidden" name="direction" value="up" />
                    <SubmitButton variant="ghost">Move module up</SubmitButton>
                  </form>
                ) : null}
                {moduleIndex < studio.modules.length - 1 ? (
                  <form action={moveModuleAction}>
                    <input type="hidden" name="slug" value={studio.slug} />
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input type="hidden" name="direction" value="down" />
                    <SubmitButton variant="ghost">Move module down</SubmitButton>
                  </form>
                ) : null}
                <form action={deleteModuleAction}>
                  <input type="hidden" name="slug" value={studio.slug} />
                  <input type="hidden" name="moduleId" value={module.id} />
                  <SubmitButton variant="danger">Delete module</SubmitButton>
                </form>
              </div>
              {module.lessons.map((lesson, lessonIndex) => (
                <details key={lesson.id} className="sheet">
                  <summary>
                    {lesson.kind === "quiz" ? "Quiz" : "Reading"} · {lesson.title}
                  </summary>
                  <ActionForm action={updateLessonAction} className="stack" >
                    <input type="hidden" name="slug" value={studio.slug} />
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <TextField label="Lesson title" name="title" defaultValue={lesson.title} required maxLength={120} />
                    <TextField label="Minutes" name="minutes" defaultValue={String(lesson.minutes)} required maxLength={3} />
                    <AreaField label={lesson.kind === "quiz" ? "Introduction" : "Reading"} name="body" defaultValue={lesson.body} maxLength={12000} rows={10} />
                    <SubmitButton pending="Saving…">Save lesson</SubmitButton>
                  </ActionForm>
                  <div className="row" style={{ marginTop: 10 }}>
                    {lessonIndex > 0 ? (
                      <form action={moveLessonAction}>
                        <input type="hidden" name="slug" value={studio.slug} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="up" />
                        <SubmitButton variant="ghost">Move up</SubmitButton>
                      </form>
                    ) : null}
                    {lessonIndex < module.lessons.length - 1 ? (
                      <form action={moveLessonAction}>
                        <input type="hidden" name="slug" value={studio.slug} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <input type="hidden" name="direction" value="down" />
                        <SubmitButton variant="ghost">Move down</SubmitButton>
                      </form>
                    ) : null}
                    <form action={deleteLessonAction}>
                      <input type="hidden" name="slug" value={studio.slug} />
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <SubmitButton variant="danger">Delete lesson</SubmitButton>
                    </form>
                  </div>
                  {lesson.kind === "quiz" ? (
                    <div className="stack" style={{ marginTop: 16 }}>
                      <h3>Questions</h3>
                      {lesson.questions.map((question) => (
                        <div key={question.id}>
                          <p>{question.prompt}</p>
                          <ul>
                            {question.choices.map((choice) => (
                              <li key={choice.id}>
                                {choice.label}
                                {choice.correct ? " · Correct" : ""}
                              </li>
                            ))}
                          </ul>
                          <form action={deleteQuestionAction}>
                            <input type="hidden" name="slug" value={studio.slug} />
                            <input type="hidden" name="questionId" value={question.id} />
                            <SubmitButton variant="danger">Delete question</SubmitButton>
                          </form>
                        </div>
                      ))}
                      <ActionForm action={addQuestionAction} className="stack">
                        <h3>Add a question</h3>
                        <input type="hidden" name="slug" value={studio.slug} />
                        <input type="hidden" name="lessonId" value={lesson.id} />
                        <AreaField label="Question" name="prompt" required maxLength={400} rows={3} />
                        <TextField label="Explanation" name="explanation" maxLength={600} />
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="row">
                            <TextField label={`Answer ${index + 1}`} name={`choice${index}`} maxLength={200} />
                            <label className="check">
                              <input type="radio" name="correct" value={index} required={index === 0} /> Correct
                            </label>
                          </div>
                        ))}
                        <SubmitButton variant="brass" pending="Adding…">Add question</SubmitButton>
                      </ActionForm>
                    </div>
                  ) : null}
                </details>
              ))}
              <ActionForm action={addLessonAction} className="stack">
                <h3>Add a lesson</h3>
                <input type="hidden" name="slug" value={studio.slug} />
                <input type="hidden" name="moduleId" value={module.id} />
                <TextField label="Title" name="title" required maxLength={120} />
                <label className="field">
                  <span>Kind</span>
                  <select name="kind" defaultValue="reading">
                    <option value="reading">Reading</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </label>
                <TextField label="Minutes" name="minutes" defaultValue="10" required maxLength={3} />
                <SubmitButton variant="brass" pending="Adding…">Add lesson</SubmitButton>
              </ActionForm>
            </div>
          </details>
        ))}
        <ActionForm action={addModuleAction} className="sheet stack">
          <h2>Add a module</h2>
          <input type="hidden" name="slug" value={studio.slug} />
          <TextField label="Module title" name="title" required maxLength={120} />
          <SubmitButton variant="brass" pending="Adding…">Add module</SubmitButton>
        </ActionForm>
      </section>

      <section className="sheet">
        <h2>Roster</h2>
        <p className="muted">People who enrolled. Sample records from the house curriculum are not listed here.</p>
        {studio.roster.length === 0 ? <p>No one has enrolled yet.</p> : (
          <table>
            <thead>
              <tr>
                <th scope="col">Learner</th>
                <th scope="col">Email</th>
                <th scope="col">Progress</th>
              </tr>
            </thead>
            <tbody>
              {studio.roster.map((learner) => {
                const progress = progressOf(learner.done, learner.total);
                return (
                  <tr key={learner.email + learner.name}>
                    <td>{learner.name}</td>
                    <td>{learner.email || "—"}</td>
                    <td>
                      <Meter done={progress.done} total={progress.total} percent={progress.percent} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <ActionForm action={deleteCourseAction} className="sheet stack">
        <h2>Delete course</h2>
        <p className="muted">This removes the outline, enrollments, and quiz scores for this course.</p>
        <input type="hidden" name="slug" value={studio.slug} />
        <label className="check">
          <input type="checkbox" name="confirm" value="yes" required /> I want to delete this course
        </label>
        <SubmitButton variant="danger" pending="Deleting…">Delete course</SubmitButton>
      </ActionForm>
    </div>
  );
}
