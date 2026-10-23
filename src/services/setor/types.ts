import type { z } from "zod";
import type { setorSchema } from "./schema";
export type Setor = z.infer<typeof setorSchema>;
