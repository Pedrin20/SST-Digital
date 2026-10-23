import type { z } from "zod";
import type { unidadeSchema } from "./schema";
export type Unidade = z.infer<typeof unidadeSchema>;
