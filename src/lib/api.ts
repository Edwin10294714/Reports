const API_URL = import.meta.env.VITE_API_URL;

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json(); // { status: "ok", service: "reporting-api" }
}

export async function getMetrics() {
  const res = await fetch(`${API_URL}/api/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export async function downloadSampleReport() {
  const res = await fetch(`${API_URL}/api/reports/sample-metrics`);
  if (!res.ok) throw new Error("Failed to generate report");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SampleMetricsReport.pdf";
  a.click();
  URL.revokeObjectURL(url);
}