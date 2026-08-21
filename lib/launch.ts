import launchData from "@/data/launch-readiness.json";

export type LaunchGateStatus = "ready" | "blocked" | "planned";

export type LaunchGate = {
  id: string;
  title: string;
  status: LaunchGateStatus;
  required_for_indexing: boolean;
  detail: string;
};

export type LaunchReadiness = {
  updated_at: string;
  market: string;
  publication_status: "prototype" | "launch-ready";
  title: string;
  accent: string;
  description: string;
  gates: LaunchGate[];
};

export const launchReadiness = launchData as LaunchReadiness;
export const indexingGates = launchReadiness.gates.filter((gate) => gate.required_for_indexing);
export const launchBlockers = indexingGates.filter((gate) => gate.status !== "ready");
export const isLaunchReadyForIndexing = launchBlockers.length === 0;

export function getLaunchStats() {
  return {
    readyGateCount: indexingGates.filter((gate) => gate.status === "ready").length,
    requiredGateCount: indexingGates.length,
    blockerCount: launchBlockers.length,
  };
}
