export type FieldType = "text" | "date" | "time" | "number" | "textarea" | "checkbox" | "select" | "select-multi";

export type FieldSpec = {
  name: string;
  label: string;
  type: FieldType;
};

export type SectionSpec = {
  title: string;
  fields: FieldSpec[];
};
export type MeteoSpec = {
  title: string;
  checkboxes: FieldSpec[];
};

export type ServiceKey = "passenger" | "traffic" | "ramp" | "cargo";

export type ServiceSpec = {
  key: ServiceKey;
  label: string;
  path: string;
  description: string;
  sections: SectionSpec[];
};
export const trafficAgents = [
  "Alice Goussale",
  "Enzo Gaude",
  "Lucie Milliere",
  "Romain Bonnefille",
  "Steven Laurent",
];
export const passengerAgents = [
  "Amal Boumedien",
  "Augustine Roussinet",
  "Mouhamed Mbaye",
  "Sheryne Guemazi",
];

const flightSection: SectionSpec = {
  title: "Informations générales",
  fields: [
    { name: "date", label: "Date", type: "date" },
    { name: "startTime", label: "Heure de début vacation", type: "time" },
    { name: "endTime", label: "Heure de fin vacation", type: "time" },
    { name: "flightNumber", label: "Numéro de vol", type: "text" },
    { name: "destination", label: "Destination", type: "text" },
    { name: "registration", label: "Immatriculation", type: "text" },
    { name: "paxArrival", label: "Passagers à l'arrivée", type: "number" },
    { name: "paxDeparture", label: "Passagers au départ", type: "number" },
  ],
};

const timesSection: SectionSpec = {
  title: "Horaires & Retards",
  fields: [
    { name: "schedArrival", label: "Heure d'arrivée prévue", type: "time" },
    { name: "actualArrival", label: "Heure d'arrivée réelle", type: "time" },
    { name: "disembarkEnd", label: "Fin du débarquement", type: "time" },
    { name: "boardingEnd", label: "Fin de l'embarquement", type: "time" },
    { name: "schedDeparture", label: "Heure de départ prévue", type: "time" },
    { name: "actualDeparture", label: "Heure de départ réelle", type: "time" },
    { name: "takeOffTime", label: "Heure de décollage", type: "time" },
    { name: "delayCode", label: "Code retard", type: "text" },
    { name: "delayReason", label: "Motif du retard", type: "textarea" },
  ],
};

const signOffSection = (): SectionSpec => ({
  title: "Personnel",
  fields: [
    { name: "completedBy", label: "Agent(s) ayant complété le formulaire", type: "select" },
    { name: "supervisorName", label: "Superviseur de vol", type: "select" },
    { name: "todayAgents", label: "Nombre d'agents du jour", type: "number" },
    { name: "interimAgents", label: "Nombre d'agents intérimaires", type: "number" },
  ],
});

const signOffSectionForTraffic = (): SectionSpec => ({
  title: "Personnel",
  fields: [
    { name: "completedBy", label: "Agent(s) ayant complété le formulaire", type: "select" },
    { name: "agentName", label: "Agent entrant", type: "select" },
  ],
});

export const SERVICES: ServiceSpec[] = [
  {
    key: "passenger",
    label: "Passage",
    path: "/",
    description:
      "Rapport d'enregistrement, d'embarquement, d'arrivée et de traitement des passagers",
    sections: [
      flightSection,
      {
        title: "Agents affectés",
        fields: [
          { name: "ticketingAgent", label: "Agent billetterie", type: "select" },
          { name: "webCheckAgent", label: "Agent Web Check", type: "select" },
          { name: "checkinAgents", label: "Agents check-in", type: "select" },
          {
            name: "parkingBagClaimInfoAgent",
            label: "Agent parking / livraison bagages / information",
            type: "select",
          },
          { name: "boardingAgents", label: "Agents embarquement", type: "select" },
        ],
      },
      {
        title: "Check-in",
        fields: [
          { name: "checkinSummary", label: "Résumé du check-in", type: "textarea" },
          { name: "baggagesChecked", label: "Nombre de bagages enregistrés", type: "number" },
          { name: "numberOfPayments", label: "Nombre de paiements", type: "number" },
          { name: "amount", label: "Montant", type: "text" },
        ],
      },
      {
        title: "Embarquement & Arrivée",
        fields: [
          { name: "boardingSummary", label: "Résumé de l'embarquement", type: "textarea" },
          { name: "arrivalSummary", label: "Résumé de l'arrivée", type: "textarea" },
        ],
      },
      timesSection,
      {
        title: "Résumés des opérations",
        fields: [
          { name: "parkingSummary", label: "Résumé parking", type: "textarea" },
          { name: "bagClaimSummary", label: "Résumé livraison des bagages", type: "textarea" },
          { name: "lostFoundSummary", label: "Résumé objets trouvés", type: "textarea" },
          {
            name: "technicalIssueSummary",
            label: "Résumé des problèmes techniques",
            type: "textarea",
          },
          { name: "cleaningSummary", label: "Résumé du nettoyage", type: "textarea" },
          {
            name: "safetySecurityIncidents",
            label: "Incidents de sûreté et de sécurité",
            type: "textarea",
          },
          { name: "specificDirectives", label: "Directives spécifiques", type: "textarea" },
        ],
      },
      signOffSection(),
    ],
  },
  {
    key: "traffic",
    label: "Trafic",
    path: "/traffic",
    description: "Rapport de contrôle de charge, documentation et dispatch",
    sections: [
      flightSection,
      {
        title: "Contrôle de charge",
        fields: [
          { name: "loadsheetSummary", label: "Résumé loadsheet", type: "textarea" },
          { name: "weightBalanceSummary", label: "Résumé poids et centrage", type: "textarea" },
          { name: "cargoLoadKg", label: "Charge cargo (kg)", type: "number" },
          { name: "baggageLoadKg", label: "Charge bagages (kg)", type: "number" },
          { name: "fuelFigures", label: "Chiffres carburant", type: "text" },
        ],
      },
      {
        title: "Documentation & Coordination",
        fields: [
          { name: "documentationSummary", label: "Résumé documentation", type: "textarea" },
          { name: "crewBriefingSummary", label: "Résumé briefing équipage", type: "textarea" },
          { name: "messagesSent", label: "Messages envoyés (MVT, LDM, PSM...)", type: "textarea" },
        ],
      },
      timesSection,
      {
        title: "Incidents & Directives",
        fields: [
          {
            name: "technicalIssueSummary",
            label: "Résumé des problèmes techniques",
            type: "textarea",
          },
          {
            name: "safetySecurityIncidents",
            label: "Incidents de sûreté et de sécurité",
            type: "textarea",
          },
          { name: "specificDirectives", label: "Directives spécifiques", type: "textarea" },
        ],
      },
      signOffSectionForTraffic(),
    ],
  },
  {
    key: "ramp",
    label: "Piste",
    path: "/ramp",
    description: "Rapport de manutention avion, GSE, chargement et pushback",
    sections: [
      flightSection,
      {
        title: "Équipe ramp",
        fields: [
          { name: "rampAgents", label: "Agents ramp", type: "text" },
          { name: "loadingTeam", label: "Équipe de chargement", type: "text" },
          { name: "gseUsed", label: "GSE utilisés", type: "textarea" },
          { name: "gseIssues", label: "Problèmes GSE / équipement inutilisable", type: "textarea" },
        ],
      },
      {
        title: "Manutention avion",
        fields: [
          { name: "loadingSummary", label: "Résumé chargement", type: "textarea" },
          { name: "unloadingSummary", label: "Résumé déchargement", type: "textarea" },
          { name: "pushbackSummary", label: "Résumé pushback / remorquage", type: "textarea" },
          { name: "fuelingSummary", label: "Résumé ravitaillement", type: "textarea" },
          { name: "cleaningSummary", label: "Résumé du nettoyage", type: "textarea" },
          { name: "waterLavatorySummary", label: "Résumé eau & toilettes", type: "textarea" },
        ],
      },
      timesSection,
      {
        title: "Incidents & Directives",
        fields: [
          {
            name: "aircraftDamageReport",
            label: "Rapport dommages avion / équipement",
            type: "textarea",
          },
          {
            name: "technicalIssueSummary",
            label: "Résumé des problèmes techniques",
            type: "textarea",
          },
          {
            name: "safetySecurityIncidents",
            label: "Incidents de sûreté et de sécurité",
            type: "textarea",
          },
          { name: "specificDirectives", label: "Directives spécifiques", type: "textarea" },
        ],
      },
      signOffSection(),
    ],
  },
  {
    key: "cargo",
    label: "Bureau Fret",
    path: "/cargo",
    description: "Rapport de fret, courrier, marchandises dangereuses et entrepôt",
    sections: [
      flightSection,
      {
        title: "Manutention cargo",
        fields: [
          { name: "cargoAgents", label: "Agents cargo", type: "text" },
          { name: "piecesIn", label: "Colis reçus (arrivée)", type: "number" },
          { name: "weightInKg", label: "Poids arrivée (kg)", type: "number" },
          { name: "piecesOut", label: "Colis expédiés (départ)", type: "number" },
          { name: "weightOutKg", label: "Poids départ (kg)", type: "number" },
          { name: "mailSummary", label: "Résumé courrier", type: "textarea" },
          { name: "uldSummary", label: "Résumé ULD", type: "textarea" },
        ],
      },
      {
        title: "Cargo spécial & Entrepôt",
        fields: [
          {
            name: "dangerousGoodsSummary",
            label: "Résumé marchandises dangereuses",
            type: "textarea",
          },
          {
            name: "perishablesSummary",
            label: "Résumé périssables / cargo spécial",
            type: "textarea",
          },
          { name: "warehouseSummary", label: "Résumé entrepôt", type: "textarea" },
          { name: "discrepanciesSummary", label: "Résumé écarts / dommages", type: "textarea" },
          { name: "documentationSummary", label: "Résumé documentation", type: "textarea" },
        ],
      },
      timesSection,
      {
        title: "Incidents & Directives",
        fields: [
          {
            name: "technicalIssueSummary",
            label: "Résumé des problèmes techniques",
            type: "textarea",
          },
          {
            name: "safetySecurityIncidents",
            label: "Incidents de sûreté et de sécurité",
            type: "textarea",
          },
          { name: "specificDirectives", label: "Directives spécifiques", type: "textarea" },
        ],
      },
      signOffSection(),
    ],
  },
];

export function getService(key: ServiceKey): ServiceSpec {
  const found = SERVICES.find((s) => s.key === key);
  if (!found) throw new Error(`Unknown service: ${key}`);
  return found;
}
