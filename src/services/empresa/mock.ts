import { createMock } from "../shared";
import { empresaSchema } from "./schema";
import type { Empresa } from "./types";
export const empresaFixtures: Empresa[] = [
  {
    "id": "emp-1",
    "nome": "Metalúrgica Horizonte Ltda.",
    "cnpj": "12345678000195",
    "ativa": true
  }
];
export const empresaMock = createMock("empresa", empresaSchema, empresaFixtures);
