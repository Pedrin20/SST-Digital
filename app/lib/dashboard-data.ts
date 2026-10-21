export type Severity = "CRÍTICO" | "ALTO" | "MÉDIO" | "BAIXO";

export type RiskSector = {
  sector: string;
  hazard: string;
  severity: Severity;
  exposed: number;
  score: string;
  trend: "Alta" | "Estável" | "Melhorando";
};

export const riskSectors: RiskSector[] = [
  {
    sector: "Usinagem Pesada & CNC",
    hazard: "Operador de prensa hidráulica · Procedimento NR-12 desatualizado",
    severity: "CRÍTICO",
    exposed: 14,
    score: "9,2",
    trend: "Alta",
  },
  {
    sector: "Caldeiraria & Soldagem",
    hazard: "Soldador em espaço confinado sem ventilação adequada · NR-33/35",
    severity: "ALTO",
    exposed: 82,
    score: "7,6",
    trend: "Estável",
  },
  {
    sector: "Pintura Eletrostática",
    hazard: "Contato com solventes e tintas epóxi · NR-06/NR-26",
    severity: "MÉDIO",
    exposed: 38,
    score: "5,4",
    trend: "Melhorando",
  },
  {
    sector: "Pátio de Carga & Logística",
    hazard: "Circulação de empilhadeiras sem faixa exclusiva · NR-11/NR-12",
    severity: "ALTO",
    exposed: 42,
    score: "7,1",
    trend: "Estável",
  },
];

export type RootCause = {
  cause: string;
  percent: number;
  events: number;
};

export const rootCauses: RootCause[] = [
  { cause: "Não conformidade com EPI", percent: 38, events: 146 },
  { cause: "Uso incorreto de EPI", percent: 26, events: 98 },
  { cause: "Desvio no ciclo de carga", percent: 18, events: 69 },
  { cause: "Falha em treinamento no turno", percent: 11, events: 42 },
  { cause: "Ordenamento inadequado", percent: 7, events: 26 },
];

export type NCStatus = "Pendente" | "Em andamento" | "Concluída";

export type NonConformity = {
  id: string;
  date: string;
  time: string;
  shift: string;
  sector: string;
  equipment: string;
  hazard: string;
  norm: string;
  severity: Severity;
  owner: string;
  role: string;
  deadline: string;
  overdue?: boolean;
  status: NCStatus;
  action: string;
};

export const nonConformities: NonConformity[] = [
  {
    id: "INC-2026-089",
    date: "09 Out",
    time: "09:24",
    shift: "Turno 1",
    sector: "Usinagem Pesada & CNC",
    equipment: "Fresadora P-414",
    hazard: "Máquina sem proteção no ponto de operação",
    norm: "NR-12",
    severity: "CRÍTICO",
    owner: "Marcos Silveira",
    role: "Manutenção",
    deadline: "Hoje, 18h",
    overdue: true,
    status: "Em andamento",
    action: "Verificar",
  },
  {
    id: "INC-2026-088",
    date: "09 Out",
    time: "08:10",
    shift: "Turno 2",
    sector: "Caldeiraria & Soldagem",
    equipment: "Bancada 03",
    hazard: "Cabo de rede, tomadas e extensões sem proteção",
    norm: "NR-10",
    severity: "CRÍTICO",
    owner: "Renato Alencar",
    role: "Produção",
    deadline: "Hoje, 17h",
    overdue: true,
    status: "Em andamento",
    action: "Corrigir",
  },
  {
    id: "INC-2026-085",
    date: "09 Out",
    time: "17:40",
    shift: "Turno 3",
    sector: "Pintura Eletrostática",
    equipment: "Cabine 02",
    hazard: "Exposição a solvente sem proteção respiratória adequada",
    norm: "NR-33",
    severity: "ALTO",
    owner: "Dra. Juliana Prado",
    role: "Higiene Ocupacional",
    deadline: "24 horas",
    status: "Pendente",
    action: "Calibrar detector",
  },
  {
    id: "INC-2026-083",
    date: "08 Out",
    time: "16:10",
    shift: "Turno 1",
    sector: "Pátio de Carga",
    equipment: "Empilhadeira Hyster 07",
    hazard: "Alarme de ré e buzzer desativados",
    norm: "NR-11",
    severity: "ALTO",
    owner: "Fabiano Costa",
    role: "Logística",
    deadline: "Amanhã, 12h",
    status: "Pendente",
    action: "Solicitar revisão",
  },
  {
    id: "INC-2026-079",
    date: "07 Out",
    time: "22:10",
    shift: "Turno 2",
    sector: "Caldeiraria & Soldagem",
    equipment: "Bancada 01",
    hazard: "Máscara de solda automática com filtro inadequado",
    norm: "NR-06",
    severity: "MÉDIO",
    owner: "Amarildo Alves",
    role: "Turno 2",
    deadline: "11 Out",
    status: "Em andamento",
    action: "Editar",
  },
  {
    id: "INC-2026-076",
    date: "06 Out",
    time: "10:45",
    shift: "Turno 1",
    sector: "Usinagem Pesada & CNC",
    equipment: "Torno CNC 12",
    hazard: "Extintor de incêndio com carga vencida",
    norm: "NR-23",
    severity: "MÉDIO",
    owner: "Paula Menezes",
    role: "Brigada de Incêndio",
    deadline: "12 Out",
    status: "Concluída",
    action: "Finalizada",
  },
  {
    id: "INC-2026-071",
    date: "05 Out",
    time: "07:30",
    shift: "Turno 1",
    sector: "Pátio de Carga",
    equipment: "Área de manobras",
    hazard: "Sinalização de piso apagada na zona de pedestres",
    norm: "NR-26",
    severity: "BAIXO",
    owner: "Sérgio Duarte",
    role: "SESMT",
    deadline: "14 Out",
    status: "Concluída",
    action: "Finalizada",
  },
];
