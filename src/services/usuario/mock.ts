import { createMock } from "../shared";
import { usuarioSchema } from "./schema";
import type { Usuario } from "./types";
export const usuarioFixtures: Usuario[] = [
  {
    "id": "usr-1",
    "nome": "Sérgio Duarte",
    "email": "sergio.duarte@example.com",
    "ativo": true
  },
  {
    "id": "usr-2",
    "nome": "Marcos Silveira",
    "email": "marcos.silveira@example.com",
    "ativo": true
  }
];
export const usuarioMock = createMock("usuario", usuarioSchema, usuarioFixtures);
