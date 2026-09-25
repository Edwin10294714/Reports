import { Router } from "express";
import { getAcademicYears } from "../services/dashboard.service.js";
import type { AcademicYearsResponse } from "../types/dashboard.js";

export const academicYearsRouter = Router();

academicYearsRouter.get("/", async (_req, res) => {
  try {
    const response: AcademicYearsResponse = {
      data: await getAcademicYears(),
    };

    res.json(response);
  } catch (error) {
    console.error("Academic years error:", error);
    res.status(500).json({
      error: {
        code: "ACADEMIC_YEARS_ERROR",
        message: "Unable to load academic years.",
      },
    });
  }
});
