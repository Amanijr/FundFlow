export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_API === "true";
}

/** Artificial delay so loading animations are visible in mock mode */
export const MOCK_LATENCY_MS = 280;

export async function mockDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
}
