const ONBOARDING_KEY = "fundflow-onboarding-complete";

export function isOnboardingComplete() {
  if (typeof window === "undefined") {
    return true;
  }
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function clearOnboardingComplete() {
  localStorage.removeItem(ONBOARDING_KEY);
}
