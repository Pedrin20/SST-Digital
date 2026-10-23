import type { z } from "zod";
import type { documentoSchema } from "./schema";
export type Documento = z.infer<typeof documentoSchema>;
