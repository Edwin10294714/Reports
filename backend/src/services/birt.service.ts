import { spawn } from "child_process";
import path from "path";
import { env } from "../config/env.js";

type BirtParameter = {
  name: string;
  value: string | number;
};

export function runBirtReport(
  reportName: string,
  outputPath: string,
  parameters: BirtParameter[] = [],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reportPath = path.join(env.birtReportsPath, reportName);
    const genReport = path.join(env.birtEnginePath, "genReport.bat");
    const comspec = process.env.ComSpec;

    if (!comspec) {
      reject(new Error("Windows ComSpec environment variable is not configured"));
      return;
    }

    console.log("Starting BIRT...");
    console.log("Report:", reportPath);
    console.log("Output:", outputPath);

    const parameterArgs = parameters.flatMap(({ name, value }) => [
      "-p",
      `${name}=${value}`,
    ]);

    const birt = spawn(
      comspec,
      [
        "/c",
        genReport,
        "-f",
        "PDF",
        "-o",
        outputPath,
        ...parameterArgs,
        reportPath,
      ],
      {
        cwd: env.birtEnginePath,
        windowsHide: true,
        env: {
          ...process.env,
          ComSpec: comspec,
        },
      },
    );

    let stdout = "";
    let stderr = "";

    birt.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(data.toString());
    });

    birt.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });

    birt.on("error", (error) => {
      reject(error);
    });

    birt.on("close", (code) => {
      console.log("BIRT process exited with code:", code);

      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `BIRT failed with exit code ${code}\n${stdout}\n${stderr}`,
        ),
      );
    });
  });
}
