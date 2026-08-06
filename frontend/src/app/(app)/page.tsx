"use client";

import { LoadingState } from "@/components/feedback/loading-state";
import { TaskHome } from "@/components/home/task-home";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, isReady } = useAuth();

  if (!isReady || !user) {
    return <LoadingState />;
  }

  return <TaskHome />;
}
