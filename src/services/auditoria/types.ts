import type { z } from "zod";
import type { auditoriaSchema } from "./schema";
export type Auditoria = z.infer<typeof auditoriaSchema>;
