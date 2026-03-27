import { z } from "zod";

// ─── Plain TypeScript types (no Drizzle / SQLite dependency) ───

export interface Plan {
  id: number;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
  rawText: string | null;
  pageCount: number | null;
  progressStep: number | null;
  progressMessage: string | null;
  errorMessage: string | null;
}

export interface Analysis {
  id: number;
  planId: number;
  overallScore: number | null;
  overallGrade: string | null;
  complianceScore: number | null;
  analyticalScore: number | null;
  implementationScore: number | null;
  scenarioScore: number | null;
  equityScore: number | null;
  gateApplied: number | null;
  gateMessage: string | null;
  jurisdictionName: string | null;
  stateName: string | null;
  countyFips: string | null;
  planType: string | null;
  extractionConfidence: number | null;
  executiveSummary: string | null;
  threeThings: string | null;
  ninetyDayPlan: string | null;
  createdAt: string;
}

export interface Hazard {
  id: number;
  analysisId: number;
  hazardName: string;
  planProbability: string | null;
  planImpact: string | null;
  planLossEstimate: number | null;
  verifiedRating: string | null;
  eventCount: number | null;
  discrepancyType: string | null;
  finding: string | null;
}

export interface MitigationAction {
  id: number;
  analysisId: number;
  actionId: string | null;
  description: string;
  hazardsAddressed: string | null;
  responsibleParty: string | null;
  timeline: string | null;
  estimatedCost: number | null;
  fundingSource: string | null;
  fundingSecured: number | null;
  status: string | null;
  priority: string | null;
  actionType: string | null;
  actionQuality: number | null;
}

export interface ComplianceElement {
  id: number;
  analysisId: number;
  elementCode: string;
  elementName: string;
  status: string;
  score: number | null;
  evidence: string | null;
  severity: string | null;
}

export interface ScenarioLink {
  id: number;
  analysisId: number;
  hazardType: string;
  linkName: string;
  protectionStatus: string;
  evidence: string | null;
  matchingActions: string | null;
}

export interface GrantMatch {
  id: number;
  analysisId: number;
  actionDescription: string | null;
  program: string;
  estimatedFederal: number | null;
  estimatedLocalMatch: number | null;
  federalSharePct: number | null;
  confidence: string | null;
  reasoning: string | null;
  applicationTips: string | null;
}

export interface Finding {
  id: number;
  analysisId: number;
  level: number;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string | null;
}

// ─── Insert types (omit `id` which is auto-generated) ───

export type InsertPlan = Omit<Plan, "id">;
export type InsertAnalysis = Omit<Analysis, "id">;
export type InsertHazard = Omit<Hazard, "id">;
export type InsertMitigationAction = Omit<MitigationAction, "id">;
export type InsertComplianceElement = Omit<ComplianceElement, "id">;
export type InsertScenarioLink = Omit<ScenarioLink, "id">;
export type InsertGrantMatch = Omit<GrantMatch, "id">;
export type InsertFinding = Omit<Finding, "id">;

// ─── Zod validation schemas (used in routes for request validation) ───

export const insertPlanSchema = z.object({
  filename: z.string(),
  fileSize: z.number(),
  uploadedAt: z.string(),
  status: z.string().default("uploading"),
  rawText: z.string().nullable().optional(),
  pageCount: z.number().nullable().optional(),
  progressStep: z.number().nullable().optional(),
  progressMessage: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
});

// ─── Full analysis result type for API response ───

export interface FullAnalysis {
  analysis: Analysis;
  hazards: Hazard[];
  mitigationActions: MitigationAction[];
  complianceElements: ComplianceElement[];
  scenarioLinks: ScenarioLink[];
  grantMatches: GrantMatch[];
  findings: Finding[];
}
