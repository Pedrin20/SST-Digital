import type { z } from "zod";
import type { equipamentoSchema } from "./schema";
export type Equipamento = z.infer<typeof equipamentoSchema>;
