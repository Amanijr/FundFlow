"use client";

import { create } from "zustand";

export type MfaMethod = "totp" | "email";

interface MfaChallenge {
  mfaToken: string;
  availableMethods: MfaMethod[];
  maskedEmail?: string;
}

interface MfaState extends MfaChallenge {
  setChallenge: (challenge: MfaChallenge) => void;
  clearChallenge: () => void;
}

const emptyChallenge: MfaChallenge = {
  mfaToken: "",
  availableMethods: [],
};

function readStoredChallenge(): MfaChallenge {
  if (typeof window === "undefined") return emptyChallenge;
  const raw = window.sessionStorage.getItem("fundflow-mfa");
  if (!raw) return emptyChallenge;
  try {
    return JSON.parse(raw) as MfaChallenge;
  } catch {
    return emptyChallenge;
  }
}

export const useMfaStore = create<MfaState>((set) => ({
  ...readStoredChallenge(),
  setChallenge: (challenge) => {
    window.sessionStorage.setItem("fundflow-mfa", JSON.stringify(challenge));
    set(challenge);
  },
  clearChallenge: () => {
    window.sessionStorage.removeItem("fundflow-mfa");
    set(emptyChallenge);
  },
}));
