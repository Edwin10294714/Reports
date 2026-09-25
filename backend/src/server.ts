import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import os from "os";
import { randomUUID } from "crypto";
import { runBirtReport } from "./services/birt.service.js";
import { pool } from "./config/database.js";
import {
  InvalidAcademicYearError,
  validateAcademicYear,
} from "./services/dashboard.service.js";
import { academicYearsRouter } from "./routes/academic-years.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/dashboard", dashboardRouter);
app.use("/api/academic-years", academicYearsRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "reporting-api"
  });
});

app.get("/api/metrics", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        metric_name,
        metric_value,
        category,
        recorded_at
      FROM sample_metrics
      ORDER BY recorded_at, id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      error: "Failed to retrieve metrics"
    });
  }
});

app.get("/api/reports/sample-metrics", async (_req, res) => {
  const outputPath = path.join(
    process.cwd(),
    "temp",
    "SampleMetricsReport.pdf",
  );

  try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await runBirtReport(
      "SampleMetricsReport.rptdesign",
      outputPath,
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error("BIRT completed but PDF was not created");
    }

    const pdf = fs.readFileSync(outputPath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="SampleMetricsReport.pdf"',
    );

    res.send(pdf);

    fs.unlink(outputPath, (deleteError) => {
      if (deleteError) {
        console.error(
          "Failed to delete temporary PDF:",
          deleteError,
        );
      }
    });
  } catch (error) {
    console.error("BIRT report error:", error);

    res.status(500).json({
      error: "Failed to generate report",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Reporting API running on http://localhost:${PORT}`);
});

app.get("/api/reports/university-dashboard", async (req, res) => {
  let cleanup: (() => Promise<void>) | undefined;

  try {
    const requestedAcademicYear = readAcademicYear(req.query.academicYear);
    const academicYear = await validateAcademicYear(requestedAcademicYear);
    const outputDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "university-dashboard-"),
    );
    const outputPath = path.join(
      outputDirectory,
      `UniversityDashboard-${randomUUID()}.pdf`,
    );

    cleanup = async () => {
      await fs.promises.rm(outputDirectory, {
        recursive: true,
        force: true,
      });
    };

    await runBirtReport("UniversityDashboard.rptdesign", outputPath, [
      { name: "academicYear", value: academicYear.name },
    ]);

    if (!fs.existsSync(outputPath)) {
      throw new Error("BIRT completed but PDF was not created");
    }

    res.download(outputPath, "UniversityDashboard.pdf", async (error) => {
      await cleanup?.();

      if (error) {
        console.error("University Dashboard PDF download error:", error);
      }
    });
  } catch (error) {
    await cleanup?.();

    if (error instanceof InvalidAcademicYearError) {
      res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    console.error("University Dashboard report error:", error);
    res.status(500).json({
      error: {
        code: "UNIVERSITY_DASHBOARD_REPORT_ERROR",
        message: "Unable to generate the University Dashboard report.",
      },
    });
  }
});

function readAcademicYear(value: unknown): string | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidAcademicYearError();
  }

  return value.trim();
}
