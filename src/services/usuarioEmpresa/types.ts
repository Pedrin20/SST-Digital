import type { z } from "zod";
import type { usuarioEmpresaSchema } from "./schema";
export type UsuarioEmpresa = z.infer<typeof usuarioEmpresaSchema>;
