"use client";

import { useActionState, useState } from "react";
import { createReply, createRipple, saveProfile, type FormState } from "@/app/actions";
import { TOPICS } from "@/lib/topics";

export function DropForm({ defaultTopic }: { defaultTopic?: string }) {
  const [body, setBody] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(createRipple, null);
  const topic = TOPICS.some((item) => item.slug === defaultTopic) ? defaultTopic : "design";

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="next" value="/drop" />
      <fieldset className="grid gap-3">
        <legend className="text-xs uppercase tracking-[0.16em] text-muted">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((item) => (
            <label key={item.slug} className="chip cursor-pointer has-checked:border-heat has-checked:text-heat">
              <input
                className="sr-only"
                type="radio"
                name="topic"
                value={item.slug}
                defaultChecked={item.slug === topic}
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2" htmlFor="ripple-body">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">The line</span>
        <textarea
          id="ripple-body"
          name="body"
          required
          minLength={12}
          maxLength={220}
          rows={5}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="One sentence someone else will want to pass."
          className="field quote min-h-40 text-2xl"
        />
        <span className={`text-xs tabular-nums ${body.trim().length > 220 ? "text-ember" : "text-muted"}`}>
          {body.trim().length}/220
        </span>
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-ember">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-heat w-fit px-6" type="submit" disabled={pending}>
        {pending ? "Dropping…" : "Drop it"}
      </button>
    </form>
  );
}

export function ReplyForm({ rippleId }: { rippleId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createReply, null);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="rippleId" value={rippleId} />
      <label className="grid gap-2" htmlFor="reply-body">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">Add a twist</span>
        <textarea id="reply-body" name="body" required minLength={2} maxLength={240} rows={3} className="field" />
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-ember">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-ghost w-fit" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Reply"}
      </button>
    </form>
  );
}

export function HandleForm({
  handle,
  bio,
  next,
}: {
  handle: string | null;
  bio: string;
  next: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProfile, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      {handle ? (
        <p className="text-sm text-muted">
          Handle <span className="text-foreground">@{handle}</span> stays with this account.
        </p>
      ) : (
        <label className="grid gap-1.5 text-sm" htmlFor="handle">
          <span>Handle</span>
          <input id="handle" name="handle" required minLength={3} maxLength={20} className="field" placeholder="your.name" />
        </label>
      )}
      <label className="grid gap-1.5 text-sm" htmlFor="bio">
        <span>Bio</span>
        <textarea id="bio" name="bio" maxLength={140} rows={3} defaultValue={bio} className="field" />
      </label>
      {state?.error ? (
        <p role="alert" className="text-sm text-ember">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn-heat w-fit" type="submit" disabled={pending}>
        {pending ? "Saving…" : handle ? "Save bio" : "Claim handle"}
      </button>
    </form>
  );
}
