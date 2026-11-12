export function Meter({ done, total, percent }: { done: number; total: number; percent: number }) {
  return (
    <div>
      <p className="meta">
        {done} of {total} lessons · {percent}%
      </p>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
