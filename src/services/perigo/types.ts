import type { z } from "zod";
import type { perigoSchema } from "./schema";
export type Perigo = z.infer<typeof perigoSchema>;
