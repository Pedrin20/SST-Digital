import type { z } from "zod";
import type { usuarioSchema } from "./schema";
export type Usuario = z.infer<typeof usuarioSchema>;
