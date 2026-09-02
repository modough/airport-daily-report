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
        title: "Prise en charge spéciale prévisionnelle",
        fields: [
          {
            name: "wchrPax",
            label: "PMR attendus",
            type: "text",
          },
          {
            name: "vipPax",
            label: "VIP / STAFF attendus",
            type: "text",
          },
          {
            name: "specialRequests",
            label: "Precisez les demandes particulières",
            type: "textarea",
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
            type: "text",
          },
          {
            name: "webcheckinCounters",
            label: "Comptoir web check-in",
            type: "text",
          },
          {
            name: "boardingGate",
            label: "Porte d'embarquement",
            type: "text",
          },
          {
            name: "ticketingAgent",
            label: "Agent billetterie",
            type: "text",
          },
          {
            name: "checkinAgents",
            label: "Agents d'enregistrement",
            type: "text",
          },
          {
            name: "boardingAgents",
            label: "Agents d'embarquement",
            type: "text",
          },
          {
            name: "arrivalAgents",
            label: "Agents litiges bagages",
            type: "text",
          },
        ],
      },

      {
        title: "Consignes",
        fields: [
          {
            name: "safetyReminders",
            label: "Rappels sûreté et sécurité",
            type: "textarea",
          },
          {
            name: "specificDirectives",
            label: "Directives spécifiques",
            type: "textarea",
          },
          {
            name: "remarks",
            label: "Remarques",
            type: "textarea",
          },
        ],
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
            name: "RemarksRFFS",
            label: "Remarques RFFS",
            type: "textarea",
          },
        ],
      },
      {
        title: "Méteo",
        fields: [
          {
            name: "Sunny",
            label: "Soleil",
            type: "checkbox",
          },
          {
            name: "Cloudy",
            label: "Nuage",
            type: "checkbox",
          },
          {
            name: "Rainy",
            label: "Pluie",
            type: "checkbox",
          },
          {
            name: "Stormy",
            label: "Orage",
            type: "checkbox",
          },
          {
            name: "Snowy",
            label: "Neige",
            type: "checkbox",
          },
          {
            name: "Windy",
            label: "Vent",
            type: "checkbox",
          },
          {
            name: "Foggy",
            label: "Brume / Brouillard",
            type: "checkbox",
          },
          {
            name: "Hail",
            label: "Grêle",
            type: "checkbox",
          },
          {
            name: "Remarks",
            label: "Remarques météo",
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
            name: "cargo",
            label: "Fret",
            type: "textarea",
          },
          {
            name: "passengers",
            label: "Passage",
            type: "textarea",
          },
          {
            name: "security",
            label: "Sûreté",
            type: "textarea",
          },
          {
            name: "customs",
            label: "Douane",
            type: "textarea",
          },
          {
            name: "fueling",
            label: "Avitaillement",
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
            type: "textarea",
          },
          {
            name: "travaux",
            label: "Travaux",
            type: "textarea",
          },
          {
            name: "specificDirectives",
            label: "Directives spécifiques",
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
        label: "Vol",
        type: "text",
      },
      {
        name: "route",
        label: "Routing",
        type: "text",
      },
      {
        name: "parking",
        label: "Parking",
        type: "text",
      },
      {
        name: "sta",
        label: "STA",
        type: "time",
      },
      {
        name: "std",
        label: "STD",
        type: "time",
      },
      {
        name: "registration",
        label: "Immat.",
        type: "text",
      },
      {
        name: "tonsIn",
        label: "IN",
        type: "number",
      },
      {
        name: "tonsOut",
        label: "OUT",
        type: "number",
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
        label: "RMK",
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
        label: "Vol",
        type: "text",
      },
      {
        name: "route",
        label: "Routing",
        type: "text",
      },
      {
        name: "parking",
        label: "Parking",
        type: "text",
      },
      {
        name: "sta",
        label: "STA",
        type: "time",
      },
      {
        name: "std",
        label: "STD",
        type: "time",
      },
      {
        name: "registration",
        label: "Immat.",
        type: "text",
      },
      {
        name: "tonsIn",
        label: "IN",
        type: "number",
      },
      {
        name: "tonsOut",
        label: "OUT",
        type: "number",
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
        label: "RMK",
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
      else values[field.name] = "";
    }
  }

  const todayRows = spec.columns
    ? [createEmptyRow(spec, spec.columns), createEmptyRow(spec, spec.columns), createEmptyRow(spec, spec.columns)]
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
