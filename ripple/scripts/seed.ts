import { ensureSeed } from "../src/lib/seed";

ensureSeed()
  .then(() => {
    console.log("Ripple board is ready.");
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed failed";
    console.error(message);
    process.exitCode = 1;
  });
