import type { z } from "zod";
import type { acaoSchema } from "./schema";
export type Acao = z.infer<typeof acaoSchema>;
