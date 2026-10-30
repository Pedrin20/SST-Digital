/** Nome do cookie de sessão; compartilhado com proxy.ts, que roda fora do App Router. */
export const SESSION_COOKIE = "sst_session";

/** Duração da sessão no navegador. O token continua sendo validado pela API a cada chamada. */
export const SESSION_MAX_AGE = 60 * 60 * 8;
