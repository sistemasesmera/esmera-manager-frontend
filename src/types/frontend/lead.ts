import Alumn from "./alumn-temp";

export enum LeadSource {
  WEB = "WEB",
  WEB_ONLINE = "WEB_ONLINE",
  MANUAL = "MANUAL",
  META_ADS = "META_ADS",
}

export enum LeadStatus {
  SIN_ASIGNAR = "SIN_ASIGNAR",
  CONTACTADO = "CONTACTADO",
  EN_SEGUIMIENTO = "EN_SEGUIMIENTO",
  MATRICULADO = "MATRICULADO",
  DESCARTADO = "DESCARTADO",
}

export enum LeadDiscardReason {
  NO_RESPONDE = "NO_RESPONDE",
  SIN_PRESUPUESTO = "SIN_PRESUPUESTO",
  NO_INTERESADO = "NO_INTERESADO",
  YA_MATRICULADO_OTRO = "YA_MATRICULADO_OTRO",
  DATOS_INCORRECTOS = "DATOS_INCORRECTOS",
  OTRO = "OTRO",
}

export enum LeadCourseCategory {
  ESTETICA = "ESTETICA",
  PELUQUERIA = "PELUQUERIA",
  MAQUILLAJE = "MAQUILLAJE",
  BARBERIA = "BARBERIA",
  UNAS = "UÑAS",
  CEJASYPESTANAS = "CEJASYPESTANAS",
  SIN_GESTION = "SIN GESTION",
}

export interface LeadBranch {
  id: string;
  name: string;
}

export interface LeadAssignedTo {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export default interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  nameCourse?: string;
  categoryCourse?: LeadCourseCategory;
  status: LeadStatus;
  discardReason?: LeadDiscardReason | null;
  discardReasonOther?: string | null;
  branch?: LeadBranch;
  assignedTo?: LeadAssignedTo;
  convertedAlumn?: Alumn;
  notes?: string;
  nextContactDate?: string | null;
  contactedAt?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.SIN_ASIGNAR]: "Sin asignar",
  [LeadStatus.CONTACTADO]: "Contactado",
  [LeadStatus.EN_SEGUIMIENTO]: "En seguimiento",
  [LeadStatus.MATRICULADO]: "Matriculado",
  [LeadStatus.DESCARTADO]: "Descartado",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LeadSource.WEB]: "Web",
  [LeadSource.WEB_ONLINE]: "Web (Online)",
  [LeadSource.MANUAL]: "Manual",
  [LeadSource.META_ADS]: "Meta Ads",
};

export const LEAD_DISCARD_REASON_LABELS: Record<LeadDiscardReason, string> = {
  [LeadDiscardReason.NO_RESPONDE]: "No responde",
  [LeadDiscardReason.SIN_PRESUPUESTO]: "Sin presupuesto",
  [LeadDiscardReason.NO_INTERESADO]: "No interesado",
  [LeadDiscardReason.YA_MATRICULADO_OTRO]: "Ya matriculado en otro centro",
  [LeadDiscardReason.DATOS_INCORRECTOS]: "Datos incorrectos",
  [LeadDiscardReason.OTRO]: "Otro",
};
