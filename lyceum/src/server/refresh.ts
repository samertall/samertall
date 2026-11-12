import "server-only";

import { revalidatePath } from "next/cache";

export function refresh() {
  revalidatePath("/", "layout");
}
