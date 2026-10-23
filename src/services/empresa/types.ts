import type { z } from "zod";
import type { empresaSchema } from "./schema";
export type Empresa = z.infer<typeof empresaSchema>;
