// PROVISORIO: perfis e permissões até a API publicar o contrato definitivo.
export const profiles = ["administrador", "gestor", "tecnico", "leitor"] as const;
export type Profile = typeof profiles[number];
export type Permission = "ler" | "gerenciarRiscos" | "gerenciarAcoes" | "gerenciarUsuarios" | "auditar";
export const permissions: Record<Profile, readonly Permission[]> = {
  administrador: ["ler", "gerenciarRiscos", "gerenciarAcoes", "gerenciarUsuarios", "auditar"],
  gestor: ["ler", "gerenciarRiscos", "gerenciarAcoes", "auditar"],
  tecnico: ["ler", "gerenciarRiscos", "gerenciarAcoes"],
  leitor: ["ler"],
};
/** Apenas apresentação. A API deve autorizar cada operação e vínculo empresarial. */
export function can(profile: string | null | undefined, permission: Permission): boolean {
  return !!profile && Object.hasOwn(permissions, profile) && permissions[profile as Profile].includes(permission);
}
