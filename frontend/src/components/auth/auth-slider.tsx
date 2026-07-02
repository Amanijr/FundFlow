"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AuthMode = "sign-in" | "sign-up";

interface AuthSliderProps {
  initialMode?: AuthMode;
}

export function AuthSlider({ initialMode = "sign-in" }: AuthSliderProps) {
  const router = useRouter();
  const [signUpActive, setSignUpActive] = useState(initialMode === "sign-up");

  useEffect(() => {
    setSignUpActive(initialMode === "sign-up");
  }, [initialMode]);

  const showSignIn = useCallback(() => {
    setSignUpActive(false);
    router.replace("/login", { scroll: false });
  }, [router]);

  const showSignUp = useCallback(() => {
    setSignUpActive(true);
    router.replace("/register", { scroll: false });
  }, [router]);

  return (
    <div className="w-full max-w-[56rem]">
      {/* Mobile tab switcher */}
      <div className="mb-4 flex rounded-md border border-border bg-surface p-1 lg:hidden">
        <button
          type="button"
          onClick={showSignIn}
          className={cn(
            "flex-1 rounded-sm py-2 text-sm font-medium transition-colors",
            !signUpActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={showSignUp}
          className={cn(
            "flex-1 rounded-sm py-2 text-sm font-medium transition-colors",
            signUpActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Create account
        </button>
      </div>

      {/* Mobile: single panel */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm lg:hidden">
        {signUpActive ? (
          <RegisterForm variant="panel" onSwitchToSignIn={showSignIn} />
        ) : (
          <LoginForm variant="panel" onSwitchToSignUp={showSignUp} />
        )}
      </div>

      {/* Desktop: double-slider */}
      <div
        className={cn(
          "auth-slider relative hidden min-h-[34rem] overflow-hidden rounded-lg border border-border bg-surface shadow-sm lg:block",
          signUpActive && "auth-slider--sign-up",
        )}
      >
        <div className="auth-slider__panel auth-slider__panel--sign-up">
          <RegisterForm variant="panel" className="bg-surface" />
        </div>

        <div className="auth-slider__panel auth-slider__panel--sign-in">
          <LoginForm variant="panel" className="bg-surface" />
        </div>

        <div className="auth-slider__overlay-wrap">
          <div className="auth-slider__overlay">
            <div className="auth-slider__overlay-panel auth-slider__overlay-panel--left">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/90">
                Sign in to manage donations, expenses, and reports for your organization.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6 border-white/80 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={showSignIn}
              >
                Sign in
              </Button>
            </div>
            <div className="auth-slider__overlay-panel auth-slider__overlay-panel--right">
              <h2 className="text-2xl font-bold">Get started</h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/90">
                Create your organization workspace and set up FundFlow ERP in minutes.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6 border-white/80 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={showSignUp}
              >
                Create account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary/15 text-[10px] font-bold text-primary">
            F
          </span>
          FundFlow ERP — fundraising &amp; financial management
        </span>
      </p>
    </div>
  );
}
