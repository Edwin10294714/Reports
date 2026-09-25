import { Router } from "express";
import {
  getDashboardData,
  InvalidAcademicYearError,
} from "../services/dashboard.service.js";
import type { DashboardResponse } from "../types/dashboard.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (_req, res) => {
  try {
    const academicYear = readAcademicYear(_req.query.academicYear);
    const response: DashboardResponse = {
      data: await getDashboardData(academicYear),
    };

    res.json(response);
  } catch (error) {
    if (error instanceof InvalidAcademicYearError) {
      res.status(400).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    console.error("Dashboard data error:", error);
    res.status(500).json({
      error: {
        code: "DASHBOARD_DATA_ERROR",
        message: "Unable to load dashboard data.",
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
