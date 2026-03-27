export type EconomySummary = {
  available: boolean;
  accounts: number;
  totalBalance: number;
  topPlayer: { name: string; balance: number } | null;
};

export type ServerStatusResponse = {
  online: boolean;
  playersOnline: number;
  playersMax: number;
  pingMs: number | null;
  refreshedAt: string;
  economy: EconomySummary;
};

const API_PATH = "/api/server-status";

export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const response = await fetch(API_PATH, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Status API failed with ${response.status}`);
  }

  return (await response.json()) as ServerStatusResponse;
}
