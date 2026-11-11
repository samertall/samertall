export type Stage = "ember" | "kindling" | "wave" | "storm";

const HOUR = 60 * 60 * 1000;
const SIX_HOURS = 6 * HOUR;

export function heatScore(input: {
  passesLastHour: number;
  passesLastSixHours: number;
  passTotal: number;
  replies: number;
}) {
  return (
    input.passesLastHour * 10 +
    input.passesLastSixHours * 3 +
    input.passTotal +
    input.replies * 4
  );
}

export function tallyPasses(times: Date[], now = Date.now()) {
  let passesLastHour = 0;
  let passesLastSixHours = 0;
  let passingNow = 0;
  const recent = 15 * 60 * 1000;

  for (const time of times) {
    const age = now - time.getTime();
    if (age <= HOUR) passesLastHour += 1;
    if (age <= SIX_HOURS) passesLastSixHours += 1;
    if (age <= recent) passingNow += 1;
  }

  return {
    passesLastHour,
    passesLastSixHours,
    passTotal: times.length,
    passingNow,
  };
}

export function stageFor(heat: number): Stage {
  if (heat >= 90) return "storm";
  if (heat >= 40) return "wave";
  if (heat >= 15) return "kindling";
  return "ember";
}

export function stageLabel(stage: Stage) {
  switch (stage) {
    case "storm":
      return "Storm";
    case "wave":
      return "Wave";
    case "kindling":
      return "Kindling";
    default:
      return "Ember";
  }
}

export function heatPercent(heat: number) {
  return Math.max(6, Math.min(100, Math.round((heat / 140) * 100)));
}
