import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { CopyLink } from "@/components/copy-link";
import { PassButton } from "@/components/pass-button";
import type { Board, RippleCard } from "@/lib/board";
import { agoLabel, siteUrl } from "@/lib/format";
import { heatPercent, stageLabel } from "@/lib/heat";
import { topicLabel } from "@/lib/topics";

export function BoardView({
  board,
  showFresh = true,
  emptyTitle = "The board is quiet.",
  emptyBody = "Drop the first line. Heat shows up when other people pass it.",
}: {
  board: Board;
  showFresh?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (!board.lead) {
    return (
      <section className="panel">
        <h1 className="quote text-4xl">{emptyTitle}</h1>
        <p className="mt-3 max-w-xl text-muted">{emptyBody}</p>
        <Link href="/drop" className="btn btn-heat mt-6 w-fit">
          Drop a line
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10">
      <RippleStage card={board.lead} passesThisHour={board.passesThisHour} voices={board.voices} />
      <div className={`grid gap-10 ${showFresh ? "lg:grid-cols-2" : ""}`}>
        <RippleColumn title="Rising" note="Moving fastest right now" items={board.rising} />
        {showFresh ? <RippleColumn title="Just dropped" note="New lines, still warm" items={board.fresh} /> : null}
      </div>
    </div>
  );
}

export function RippleList({ items, empty }: { items: RippleCard[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-muted">{empty}</p>;
  }
  return (
    <ol className="grid gap-3">
      {items.map((card, index) => (
        <li key={card.id}>
          <RippleRow card={card} rank={index + 1} />
        </li>
      ))}
    </ol>
  );
}

export function RippleStage({
  card,
  passesThisHour,
  voices,
}: {
  card: RippleCard;
  passesThisHour?: number;
  voices?: number;
}) {
  return (
    <article className="stage">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tracking-[0.16em] text-muted">
        <span className={`stage-label uppercase stage-${card.stage}`}>{stageLabel(card.stage)}</span>
        <span className="uppercase">{topicLabel(card.topic)}</span>
        <span className="tracking-normal">{agoLabel(card.createdAt)}</span>
        {typeof passesThisHour === "number" ? (
          <span className="ml-auto inline-flex items-center gap-2 normal-case tracking-normal text-foreground">
            <span className="live-dot" aria-hidden="true" />
            {passesThisHour} passes this hour
            {typeof voices === "number" ? <span className="text-muted">· {voices} voices</span> : null}
          </span>
        ) : null}
      </div>
      <h1 className="quote mt-6 text-[clamp(2.1rem,5.4vw,4.4rem)] text-balance">
        <Link href={`/r/${card.id}`}>{card.body}</Link>
      </h1>
      <div className="mt-6 flex items-center gap-3">
        <Avatar name={card.author.name} seed={card.author.handle} />
        <div>
          <Link href={`/u/${card.author.handle}`} className="font-medium hover:text-heat">
            {card.author.name}
          </Link>
          <p className="text-sm text-muted">@{card.author.handle}</p>
        </div>
        <p className="ml-auto font-serif text-4xl tabular-nums text-heat">{card.heat}</p>
      </div>
      <div className="heat mt-4" aria-hidden="true">
        <span data-stage={card.stage} style={{ width: `${heatPercent(card.heat)}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">Heat · recent passes count more than old ones</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <PassButton rippleId={card.id} passed={card.passed} count={card.passes} own={card.own} size="stage" />
        <Link href={`/r/${card.id}`} className="btn btn-ghost">
          {card.replies} {card.replies === 1 ? "reply" : "replies"}
        </Link>
        <CopyLink url={`${siteUrl()}/r/${card.id}`} text={card.body} />
      </div>
    </article>
  );
}

function RippleColumn({ title, note, items }: { title: string; note: string; items: RippleCard[] }) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm uppercase tracking-[0.16em]">{title}</h2>
        <p className="text-sm text-muted">{note}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing else on the board yet.</p>
      ) : (
        <ol className="grid gap-3">
          {items.map((card) => (
            <li key={card.id}>
              <RippleRow card={card} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function RippleRow({ card, rank }: { card: RippleCard; rank?: number }) {
  return (
    <article className="row-card">
      <div className="flex items-start gap-3">
        {rank ? <span className="w-6 pt-1 text-sm tabular-nums text-muted">{rank}</span> : null}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] text-muted">
            <span className={`stage-label uppercase stage-${card.stage}`}>{stageLabel(card.stage)}</span>
            <Link href={`/t/${card.topic}`} className="uppercase">
              {topicLabel(card.topic)}
            </Link>
            <span className="tracking-normal">{agoLabel(card.createdAt)}</span>
            <span className="ml-auto font-serif text-xl normal-case tracking-normal text-heat">{card.heat}</span>
          </div>
          <h3 className="quote text-xl leading-snug text-pretty">
            <Link href={`/r/${card.id}`}>{card.body}</Link>
          </h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <Link href={`/u/${card.author.handle}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
              <Avatar name={card.author.name} seed={card.author.handle} size="sm" />
              {card.author.name}
            </Link>
            <PassButton rippleId={card.id} passed={card.passed} count={card.passes} own={card.own} />
          </div>
        </div>
      </div>
    </article>
  );
}
