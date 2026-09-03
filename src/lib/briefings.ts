import type { FieldSpec, SectionSpec } from "./services";

export type BriefingServiceKey = "passenger" | "traffic";

export type BriefingSpec = {
  key: BriefingServiceKey;
  label: string;
  description: string;
  sections: SectionSpec[];
  /** Column definitions when the briefing uses a multi-flight table */
  columns?: FieldSpec[];
  tomorrowColumns?: FieldSpec[];
};

export type BriefingRow = Record<string, string>;

export type Briefing = {
  id: string;
  service: BriefingServiceKey;
  date: string;
  values: Record<string, string>;
  rows: BriefingRow[];
  tomorrowRows?: BriefingRow[];
  createdAt: Date;
  updatedAt: Date;
};

export const BRIEFINGS: BriefingSpec[] = [
  {
    key: "passenger",
    label: "Passage",
    description: "Briefing prévisionnel des informations de vol pour le service passage",

    sections: [
      {
        title: "Détails du briefing",
        fields: [
          { name: "date", label: "Date", type: "date" },
          { name: "briefingTime", label: "Heure du briefing", type: "time" },
          {
            name: "agentName",
            label: "Rédigé par",
            type: "select",
          },
          {
            name: "supervisorName",
            label: "Nom du superviseur de vol",
            type: "select",
          },
        ],
      },

      {
        title: "Informations prévisionnelles du vol",
        fields: [
          {
            name: "flightNumber",
            label: "Numéro de vol",
            type: "text",
          },
          {
            name: "destination",
            label: "Destination",
            type: "text",
          },
          {
            name: "registration",
            label: "Immatriculation",
            type: "text",
          },
          {
            name: "aircraftType",
            label: "Type d'appareil",
            type: "text",
          },
          {
            name: "parking",
            label: "Poste de stationnement",
            type: "text",
          },
          {
            name: "sta",
            label: "STA",
            type: "time",
          },

          {
            name: "eta",
            label: "ETA",
            type: "time",
          },
          {
            name: "std",
            label: "STD",
            type: "time",
          },
          {
            name: "expectedPaxArrival",
            label: "Pax prévus à l'arrivée",
            type: "number",
          },
          {
            name: "expectedPaxDeparture",
            label: "Pax prévus au départ",
            type: "number",
          },

          {
            name: "expectedBags",
            label: "Bagages prévus à l'arrivée",
            type: "number",
          },
          {
            name: "expectedBagsDeparture",
            label: "Bagages prévus au départ",
            type: "number",
          },
          {
            name: "surbokedPax",
            label: "Vol surbook ?",
            type: "checkbox",
          },
        ],
      },
      {
        title: "Personnel et postes",
        fields: [
          {
            name: "checkinOpening",
            label: "Heure d'ouverture check-in",
            type: "time",
          },
          {
            name: "checkinCounters",
            label: "Comptoirs d'enregistrement",
            type: "select-multi",
          },
          {
            name: "webcheckinCounters",
            label: "Comptoir web check-in",
            type: "select",
          },
          {
            name: "boardingGate",
            label: "Porte d'embarquement",
            type: "select-multi",
          },
          {
            name: "ticketingAgent",
            label: "Agent billetterie",
            type: "select-multi",
          },
          {
            name: "checkinAgents",
            label: "Agents d'enregistrement",
            type: "select-multi",
          },
          {
            name: "boardingAgents",
            label: "Agents d'embarquement",
            type: "select-multi",
          },
          {
            name: "arrivalAgents",
            label: "Agents litiges bagages",
            type: "select-multi",
          },
        ],
      },

      {
        title: "Nombres de Bagages",
        fields: [
          {
            name: "cbag",
            label: "CBAG",
            type: "number",
          },
          {
            name: "bbg",
            label: "BBG",
            type: "number",
          },
          { name: "bg23", label: "BG23", type: "number" },
          {
            name: "wcmp",
            label: "WCMP",
            type: "number",
          },
          {
            name: "wclb",
            label: "WCLB",
            type: "number",
          },
          { name: "wcbd", label: "WCBD", type: "number" },
          {
            name: "golf",
            label: "GOLF",
            type: "number",
          },
          {
            name: "bike",
            label: "BIKE",
            type: "number",
          },
          {
            name: "totalBags",
            label: "Total",
            type: "badge",
          },
        ],
      },
      {
        title: "Consignes",
        fields: [
          {
            name: "safetyReminders",
            label: "Rappels sûreté et sécurité",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "specificDirectives",
            label: "Directives spécifiques",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "remarks",
            label: "Remarques",
            placeholder: "RAS",
            type: "textarea",
          },
        ],
      },
    ],
    columns: [
      {
        name: "prmType",
        label: "Type",
        type: "select",
      },
      {
        name: "paxName",
        label: "Nom",
        type: "text",
      },
      {
        name: "paxfirstName",
        label: "Prénom",
        type: "text",
      },
      {
        name: "SeqNumber",
        label: "Séquence",
        type: "text",
      },
      {
        name: "SeatNumber",
        label: "Siége",
        type: "text",
      },
      {
        name: "remarks",
        label: "RMK",
        type: "text",
      },
    ],
  },

  {
    key: "traffic",
    label: "Trafic",
    description: "Briefing prévisionnel multi-vols pour le service trafic",

    sections: [
      {
        title: "Détails du briefing",
        fields: [
          { name: "date", label: "Date", type: "date" },
          {
            name: "briefingTime",
            label: "Heure du briefing",
            type: "time",
          },
          {
            name: "supervisorName",
            label: "Rédigé par",
            type: "select",
          },
          {
            name: "agentsOnDuty",
            label: "Autres agents en service",
            type: "select-multi",
          },
        ],
      },
      {
        title: "Piste",
        fields: [
          {
            name: "pisteNumber",
            label: "Piste en service",
            type: "select",
          },
          {
            name: "pisteEtat",
            label: "Etat de la piste",
            type: "select",
          },
        ],
      },

      {
        title: "RFFS",
        fields: [
          {
            name: "rffsNiveau",
            label: "Niveau disponible",
            type: "select",
          },
          {
            name: "chefManoeuvre",
            label: "Chef de manœuvre",
            type: "select",
          },
          {
            name: "remarksRFFS",
            label: "Remarques RFFS",
            placeholder: "RAS",
            type: "textarea",
          },
        ],
      },
      {
        title: "Méteo",
        fields: [
          {
            name: "sunny",
            label: "Soleil",
            type: "checkbox",
          },
          {
            name: "cloudy",
            label: "Nuage",
            type: "checkbox",
          },
          {
            name: "rainy",
            label: "Pluie",
            type: "checkbox",
          },
          {
            name: "stormy",
            label: "Orage",
            type: "checkbox",
          },
          {
            name: "snowy",
            label: "Neige",
            type: "checkbox",
          },
          {
            name: "windy",
            label: "Vent",
            type: "checkbox",
          },
          {
            name: "foggy",
            label: "Brume / Brouillard",
            type: "checkbox",
          },
          {
            name: "hail",
            label: "Grêle",
            type: "checkbox",
          },
          {
            name: "remarksWeather",
            label: "Remarques météo",
            placeholder: "RAS",
            type: "textarea",
          },
        ],
      },
      {
        title: "Services",
        fields: [
          {
            name: "ramp",
            label: "Piste",
            placeholder: "Joignable au canal 2",
            type: "textarea",
          },
          {
            name: "passengers",
            label: "Passage",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "security",
            label: "Sûreté",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "fueling",
            label: "Avitaillement",
            placeholder: "RAS",
            type: "textarea",
          },
        ],
      },
      {
        title: "Consignes",
        fields: [
          {
            name: "notam",
            label: "Notam",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "travaux",
            label: "Travaux",
            placeholder: "RAS",
            type: "textarea",
          },
          {
            name: "divers",
            label: "Divers",
            placeholder: "RAS",
            type: "textarea",
          },
        ],
      },
    ],

    columns: [
      {
        name: "flightType",
        label: "Type",
        type: "select",
      },
      {
        name: "flightNumber",
        label: "Cie",
        type: "text",
      },
      {
        name: "aircraftType",
        label: "Appareil",
        type: "text",
      },
      {
        name: "registration",
        label: "Immat.",
        type: "text",
      },

      {
        name: "sta",
        label: "Sta(utc)",
        type: "time",
      },
      {
        name: "std",
        label: "Std(utc)",
        type: "time",
      },

      {
        name: "tonsIn",
        label: "In",
        type: "number",
      },
      {
        name: "tonsOut",
        label: "Out",
        type: "number",
      },
      {
        name: "parking",
        label: "Parking",
        type: "select",
      },
      {
        name: "catering",
        label: "Catering",
        type: "text",
      },
      {
        name: "fueling",
        label: "Fueling",
        type: "text",
      },
      {
        name: "remarks",
        label: "Remark",
        type: "text",
      },
    ],

    tomorrowColumns: [
      {
        name: "flightType",
        label: "Type",
        type: "select",
      },
      {
        name: "flightNumber",
        label: "Cie",
        type: "text",
      },
      {
        name: "aircraftType",
        label: "Appareil",
        type: "text",
      },
      {
        name: "registration",
        label: "Immat.",
        type: "text",
      },

      {
        name: "sta",
        label: "Sta(utc)",
        type: "time",
      },
      {
        name: "std",
        label: "Std(utc)",
        type: "time",
      },

      {
        name: "tonsIn",
        label: "In",
        type: "number",
      },
      {
        name: "tonsOut",
        label: "Out",
        type: "number",
      },
      {
        name: "parking",
        label: "Parking",
        type: "select",
      },
      {
        name: "catering",
        label: "Catering",
        type: "text",
      },
      {
        name: "fueling",
        label: "Fueling",
        type: "text",
      },
      {
        name: "remarks",
        label: "Remark",
        type: "text",
      },
    ],
  },
];

export function getBriefingSpec(key: BriefingServiceKey): BriefingSpec {
  const found = BRIEFINGS.find((b) => b.key === key);
  if (!found) throw new Error(`Unknown briefing service: ${key}`);
  return found;
}

const STORAGE_KEY = "station-briefings";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllBriefings(): Briefing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Briefing[]) : [];
  } catch {
    return [];
  }
}

export function getBriefings(service: BriefingServiceKey): Briefing[] {
  return getAllBriefings().filter((b) => b.service === service);
}

export function getBriefingById(id: string): Briefing | undefined {
  return getAllBriefings().find((b) => b.id === id);
}

export function saveBriefing(briefing: Briefing): void {
  if (typeof window === "undefined") return;
  const all = getAllBriefings();
  const index = all.findIndex((b) => b.id === briefing.id);
  if (index >= 0) all[index] = briefing;
  else all.unshift(briefing);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteBriefing(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getAllBriefings().filter((b) => b.id !== id)));
}

export function createEmptyRow(
  spec: BriefingSpec,
  columns: BriefingSpec["columns"] = spec.columns ?? spec.tomorrowColumns ?? [],
): BriefingRow {
  const row: BriefingRow = {};
  for (const col of columns ?? []) row[col.name] = "";
  return row;
}

export function createEmptyBriefing(service: BriefingServiceKey): Briefing {
  const spec = getBriefingSpec(service);
  const now = new Date();
  const isoNow = now.toISOString();
  const today = isoNow.split("T")[0]!;
  const currentTime = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const values: Record<string, string> = {};
  for (const section of spec.sections) {
    for (const field of section.fields) {
      if (field.name === "date") values[field.name] = today;
      else if (field.name === "briefingTime") values[field.name] = currentTime;
      else if (field.name === "ramp") values[field.name] = "JOIGNABLE SUR LE CANAL 2";
      else values[field.name] = "";
    }
  }

  const todayRows = spec.columns
    ? [
        createEmptyRow(spec, spec.columns),
        createEmptyRow(spec, spec.columns),
        createEmptyRow(spec, spec.columns),
      ]
    : [];
  const tomorrowRows = spec.tomorrowColumns
    ? [
        createEmptyRow(spec, spec.tomorrowColumns),
        createEmptyRow(spec, spec.tomorrowColumns),
        createEmptyRow(spec, spec.tomorrowColumns),
      ]
    : [];

  return {
    id: generateId(),
    service,
    date: today,
    values,
    rows: todayRows,
    tomorrowRows,
    createdAt: now,
    updatedAt: now,
  };
}
