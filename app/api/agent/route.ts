import { NextResponse } from "next/server";
import { runGoToMarketAgent, type GTMRequest } from "@/lib/agent";

const requiredFields: Array<keyof GTMRequest> = [
  "productName",
  "productSummary",
  "audience",
  "problem",
  "differentiation",
  "pricing",
  "brandVoice",
  "primaryGoal",
  "successMetric",
  "launchHorizon",
];

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<GTMRequest>;

  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missing.length) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Missing required fields.",
        missing,
      },
      { status: 400 },
    );
  }

  const response = runGoToMarketAgent(payload as GTMRequest);

  return NextResponse.json(response);
}
