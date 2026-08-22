import type {
  CollectionDashboardResponse,
  CollectionSessionCountRequest,
  CollectionSessionCreateRequest,
  CollectionSessionResponse,
} from "@/types/collection";
import { nextMockId } from "@/lib/mock/fixtures";

const sessions: CollectionSessionResponse[] = [
  {
    id: 41,
    organizationId: 1,
    collectionType: "SERVICE_OFFERING",
    title: "Sunday 1st service",
    totalAmount: 850000,
    paymentMethod: "CASH",
    collectedAt: "2026-08-16T10:00:00",
    location: "Main sanctuary",
    status: "COUNTED",
    notes: "Two bags from ushers",
    createdAt: "2026-08-16T12:15:00",
  },
];

function dashboard(): CollectionDashboardResponse {
  const verified = sessions.filter((session) => session.status === "VERIFIED" || session.status === "DEPOSITED");
  return {
    totalVerifiedAmount: verified.reduce((sum, session) => sum + Number(session.totalAmount ?? 0), 0),
    totalVerifiedSessions: verified.length,
    byCollectionType: [],
    recentSessions: [...sessions].slice(0, 5),
  };
}

export function listMockCollectionSessions() {
  return [...sessions].sort((a, b) => b.id - a.id);
}

export function getMockCollectionDashboard() {
  return dashboard();
}

export function getMockCollectionSession(id: number) {
  return sessions.find((session) => session.id === id) ?? null;
}

export function createMockCollectionSession(body: CollectionSessionCreateRequest): CollectionSessionResponse {
  const session: CollectionSessionResponse = {
    id: nextMockId(),
    organizationId: 1,
    collectionType: body.collectionType,
    title: body.title,
    description: body.description,
    location: body.location,
    notes: body.notes,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(session);
  return session;
}

export function countMockCollectionSession(
  id: number,
  body: CollectionSessionCountRequest,
): CollectionSessionResponse | null {
  const session = getMockCollectionSession(id);
  if (!session || session.status !== "DRAFT") {
    return null;
  }
  Object.assign(session, {
    totalAmount: body.totalAmount,
    paymentMethod: body.paymentMethod,
    collectedAt: body.collectedAt,
    notes: body.notes ?? session.notes,
    status: "COUNTED",
  });
  return session;
}

export function verifyMockCollectionSession(id: number): CollectionSessionResponse | null {
  const session = getMockCollectionSession(id);
  if (!session || session.status !== "COUNTED") {
    return null;
  }
  session.status = "VERIFIED";
  session.donationId = nextMockId();
  return session;
}

export function depositMockCollectionSession(id: number): CollectionSessionResponse | null {
  const session = getMockCollectionSession(id);
  if (!session || session.status !== "VERIFIED") {
    return null;
  }
  session.status = "DEPOSITED";
  return session;
}
