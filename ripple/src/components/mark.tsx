export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="11" cy="16" r="6" fill="none" stroke="#F7C948" strokeWidth="1.7" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="#F4F6F8" strokeWidth="1.7" />
      <circle cx="21" cy="16" r="6" fill="none" stroke="#FF7A3C" strokeWidth="1.7" />
    </svg>
  );
}
