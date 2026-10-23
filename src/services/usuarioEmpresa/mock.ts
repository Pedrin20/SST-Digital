import { createMock } from "../shared";
import { usuarioEmpresaSchema } from "./schema";
import type { UsuarioEmpresa } from "./types";
export const usuarioEmpresaFixtures: UsuarioEmpresa[] = [
  {
    "id": "vinc-1",
    "usuarioId": "usr-1",
    "empresaId": "emp-1",
    "perfil": "gestor",
    "ativo": true
  },
  {
    "id": "vinc-2",
    "usuarioId": "usr-2",
    "empresaId": "emp-1",
    "perfil": "tecnico",
    "ativo": true
  }
];
export const usuarioEmpresaMock = createMock("usuarioEmpresa", usuarioEmpresaSchema, usuarioEmpresaFixtures);
