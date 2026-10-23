import type { z } from "zod";
import type { avaliacaoRiscoSchema } from "./schema";
export type AvaliacaoRisco = z.infer<typeof avaliacaoRiscoSchema>;
