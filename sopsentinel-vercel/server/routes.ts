import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { runAnalysis } from "./analysis-engine";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Analyze endpoint - accepts pre-extracted text from client-side PDF parsing
  // This avoids the Vercel 4.5MB payload limit since we send text, not binary
  app.post("/api/plans/analyze", async (req, res) => {
    try {
      const { filename, fileSize, rawText, pageCount } = req.body;

      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "No text provided" });
      }

      if (!filename || typeof filename !== "string") {
        return res.status(400).json({ error: "No filename provided" });
      }

      const plan = storage.createPlan({
        filename,
        fileSize: fileSize || 0,
        uploadedAt: new Date().toISOString(),
        status: "analyzing",
        rawText,
        pageCount: pageCount || 0,
        progressStep: 2,
        progressMessage: "Starting analysis...",
        errorMessage: null,
      });

      // Start analysis in background
      runAnalysis(plan.id, rawText).catch(err => {
        console.error("Background analysis error:", err);
        storage.updatePlan(plan.id, { status: "error", errorMessage: err.message });
      });

      res.json({ id: plan.id, filename: plan.filename, status: "analyzing" });
    } catch (error: any) {
      console.error("Analyze error:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  // List all plans
  app.get("/api/plans", async (_req, res) => {
    try {
      const allPlans = storage.getAllPlans();
      // Don't send rawText in list view
      const plans = allPlans.map(p => ({
        ...p,
        rawText: undefined,
      }));
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single plan
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const plan = storage.getPlan(id);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      // Don't send rawText
      res.json({ ...plan, rawText: undefined });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get full analysis
  app.get("/api/plans/:id/analysis", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const plan = storage.getPlan(id);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      const analysis = storage.getAnalysisByPlanId(id);
      if (!analysis) return res.status(404).json({ error: "Analysis not found" });

      const hazards = storage.getHazardsByAnalysisId(analysis.id);
      const mitigationActions = storage.getMitigationActionsByAnalysisId(analysis.id);
      const complianceElements = storage.getComplianceElementsByAnalysisId(analysis.id);
      const scenarioLinks = storage.getScenarioLinksByAnalysisId(analysis.id);
      const grantMatches = storage.getGrantMatchesByAnalysisId(analysis.id);
      const findings = storage.getFindingsByAnalysisId(analysis.id);

      res.json({
        plan: { ...plan, rawText: undefined },
        analysis,
        hazards,
        mitigationActions,
        complianceElements,
        scenarioLinks,
        grantMatches,
        findings,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete plan
  app.delete("/api/plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

      const plan = storage.getPlan(id);
      if (!plan) return res.status(404).json({ error: "Plan not found" });

      storage.deletePlan(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
