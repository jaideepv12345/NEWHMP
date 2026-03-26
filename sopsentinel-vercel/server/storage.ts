import type {
  Plan, InsertPlan,
  Analysis, InsertAnalysis,
  Hazard, InsertHazard,
  MitigationAction, InsertMitigationAction,
  ComplianceElement, InsertComplianceElement,
  ScenarioLink, InsertScenarioLink,
  GrantMatch, InsertGrantMatch,
  Finding, InsertFinding,
} from "@shared/schema";

// ─── Storage interface (unchanged from original) ───

export interface IStorage {
  // Plans
  createPlan(plan: InsertPlan): Plan;
  getPlan(id: number): Plan | undefined;
  getAllPlans(): Plan[];
  updatePlan(id: number, data: Partial<InsertPlan>): Plan | undefined;
  deletePlan(id: number): void;

  // Analyses
  createAnalysis(analysis: InsertAnalysis): Analysis;
  getAnalysisByPlanId(planId: number): Analysis | undefined;
  updateAnalysis(id: number, data: Partial<InsertAnalysis>): Analysis | undefined;
  deleteAnalysesByPlanId(planId: number): void;

  // Hazards
  createHazard(hazard: InsertHazard): Hazard;
  getHazardsByAnalysisId(analysisId: number): Hazard[];
  deleteHazardsByAnalysisId(analysisId: number): void;

  // Mitigation Actions
  createMitigationAction(action: InsertMitigationAction): MitigationAction;
  getMitigationActionsByAnalysisId(analysisId: number): MitigationAction[];
  deleteMitigationActionsByAnalysisId(analysisId: number): void;

  // Compliance Elements
  createComplianceElement(element: InsertComplianceElement): ComplianceElement;
  getComplianceElementsByAnalysisId(analysisId: number): ComplianceElement[];
  deleteComplianceElementsByAnalysisId(analysisId: number): void;

  // Scenario Links
  createScenarioLink(link: InsertScenarioLink): ScenarioLink;
  getScenarioLinksByAnalysisId(analysisId: number): ScenarioLink[];
  deleteScenarioLinksByAnalysisId(analysisId: number): void;

  // Grant Matches
  createGrantMatch(grant: InsertGrantMatch): GrantMatch;
  getGrantMatchesByAnalysisId(analysisId: number): GrantMatch[];
  deleteGrantMatchesByAnalysisId(analysisId: number): void;

  // Findings
  createFinding(finding: InsertFinding): Finding;
  getFindingsByAnalysisId(analysisId: number): Finding[];
  deleteFindingsByAnalysisId(analysisId: number): void;
}

// ─── In-memory storage (no native addons, Vercel-compatible) ───

export class MemoryStorage implements IStorage {
  private planCounter = 0;
  private analysisCounter = 0;
  private hazardCounter = 0;
  private mitigationCounter = 0;
  private complianceCounter = 0;
  private scenarioCounter = 0;
  private grantCounter = 0;
  private findingCounter = 0;

  private plans = new Map<number, Plan>();
  private analysesMap = new Map<number, Analysis>();
  private hazardsMap = new Map<number, Hazard>();
  private mitigationsMap = new Map<number, MitigationAction>();
  private complianceMap = new Map<number, ComplianceElement>();
  private scenariosMap = new Map<number, ScenarioLink>();
  private grantsMap = new Map<number, GrantMatch>();
  private findingsMap = new Map<number, Finding>();

  // Plans
  createPlan(plan: InsertPlan): Plan {
    const id = ++this.planCounter;
    const record: Plan = { id, ...plan, rawText: plan.rawText ?? null, pageCount: plan.pageCount ?? null, progressStep: plan.progressStep ?? 0, progressMessage: plan.progressMessage ?? null, errorMessage: plan.errorMessage ?? null };
    this.plans.set(id, record);
    return { ...record };
  }

  getPlan(id: number): Plan | undefined {
    const p = this.plans.get(id);
    return p ? { ...p } : undefined;
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values()).sort((a, b) => b.id - a.id).map(p => ({ ...p }));
  }

  updatePlan(id: number, data: Partial<InsertPlan>): Plan | undefined {
    const existing = this.plans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.plans.set(id, updated);
    return { ...updated };
  }

  deletePlan(id: number): void {
    const analysis = this.getAnalysisByPlanId(id);
    if (analysis) {
      this.deleteHazardsByAnalysisId(analysis.id);
      this.deleteMitigationActionsByAnalysisId(analysis.id);
      this.deleteComplianceElementsByAnalysisId(analysis.id);
      this.deleteScenarioLinksByAnalysisId(analysis.id);
      this.deleteGrantMatchesByAnalysisId(analysis.id);
      this.deleteFindingsByAnalysisId(analysis.id);
    }
    this.deleteAnalysesByPlanId(id);
    this.plans.delete(id);
  }

  // Analyses
  createAnalysis(analysis: InsertAnalysis): Analysis {
    const id = ++this.analysisCounter;
    const record: Analysis = { id, ...analysis };
    this.analysesMap.set(id, record);
    return { ...record };
  }

  getAnalysisByPlanId(planId: number): Analysis | undefined {
    for (const a of this.analysesMap.values()) {
      if (a.planId === planId) return { ...a };
    }
    return undefined;
  }

  updateAnalysis(id: number, data: Partial<InsertAnalysis>): Analysis | undefined {
    const existing = this.analysesMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.analysesMap.set(id, updated);
    return { ...updated };
  }

  deleteAnalysesByPlanId(planId: number): void {
    for (const [key, a] of this.analysesMap) {
      if (a.planId === planId) this.analysesMap.delete(key);
    }
  }

  // Hazards
  createHazard(hazard: InsertHazard): Hazard {
    const id = ++this.hazardCounter;
    const record: Hazard = { id, ...hazard };
    this.hazardsMap.set(id, record);
    return { ...record };
  }

  getHazardsByAnalysisId(analysisId: number): Hazard[] {
    return Array.from(this.hazardsMap.values()).filter(h => h.analysisId === analysisId).map(h => ({ ...h }));
  }

  deleteHazardsByAnalysisId(analysisId: number): void {
    for (const [key, h] of this.hazardsMap) {
      if (h.analysisId === analysisId) this.hazardsMap.delete(key);
    }
  }

  // Mitigation Actions
  createMitigationAction(action: InsertMitigationAction): MitigationAction {
    const id = ++this.mitigationCounter;
    const record: MitigationAction = { id, ...action };
    this.mitigationsMap.set(id, record);
    return { ...record };
  }

  getMitigationActionsByAnalysisId(analysisId: number): MitigationAction[] {
    return Array.from(this.mitigationsMap.values()).filter(m => m.analysisId === analysisId).map(m => ({ ...m }));
  }

  deleteMitigationActionsByAnalysisId(analysisId: number): void {
    for (const [key, m] of this.mitigationsMap) {
      if (m.analysisId === analysisId) this.mitigationsMap.delete(key);
    }
  }

  // Compliance Elements
  createComplianceElement(element: InsertComplianceElement): ComplianceElement {
    const id = ++this.complianceCounter;
    const record: ComplianceElement = { id, ...element };
    this.complianceMap.set(id, record);
    return { ...record };
  }

  getComplianceElementsByAnalysisId(analysisId: number): ComplianceElement[] {
    return Array.from(this.complianceMap.values()).filter(c => c.analysisId === analysisId).map(c => ({ ...c }));
  }

  deleteComplianceElementsByAnalysisId(analysisId: number): void {
    for (const [key, c] of this.complianceMap) {
      if (c.analysisId === analysisId) this.complianceMap.delete(key);
    }
  }

  // Scenario Links
  createScenarioLink(link: InsertScenarioLink): ScenarioLink {
    const id = ++this.scenarioCounter;
    const record: ScenarioLink = { id, ...link };
    this.scenariosMap.set(id, record);
    return { ...record };
  }

  getScenarioLinksByAnalysisId(analysisId: number): ScenarioLink[] {
    return Array.from(this.scenariosMap.values()).filter(s => s.analysisId === analysisId).map(s => ({ ...s }));
  }

  deleteScenarioLinksByAnalysisId(analysisId: number): void {
    for (const [key, s] of this.scenariosMap) {
      if (s.analysisId === analysisId) this.scenariosMap.delete(key);
    }
  }

  // Grant Matches
  createGrantMatch(grant: InsertGrantMatch): GrantMatch {
    const id = ++this.grantCounter;
    const record: GrantMatch = { id, ...grant };
    this.grantsMap.set(id, record);
    return { ...record };
  }

  getGrantMatchesByAnalysisId(analysisId: number): GrantMatch[] {
    return Array.from(this.grantsMap.values()).filter(g => g.analysisId === analysisId).map(g => ({ ...g }));
  }

  deleteGrantMatchesByAnalysisId(analysisId: number): void {
    for (const [key, g] of this.grantsMap) {
      if (g.analysisId === analysisId) this.grantsMap.delete(key);
    }
  }

  // Findings
  createFinding(finding: InsertFinding): Finding {
    const id = ++this.findingCounter;
    const record: Finding = { id, ...finding };
    this.findingsMap.set(id, record);
    return { ...record };
  }

  getFindingsByAnalysisId(analysisId: number): Finding[] {
    return Array.from(this.findingsMap.values()).filter(f => f.analysisId === analysisId).map(f => ({ ...f }));
  }

  deleteFindingsByAnalysisId(analysisId: number): void {
    for (const [key, f] of this.findingsMap) {
      if (f.analysisId === analysisId) this.findingsMap.delete(key);
    }
  }
}

export const storage = new MemoryStorage();
