"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionTimeoutDialogProps {
  open: boolean;
  secondsRemaining: number;
  onStaySignedIn: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutDialog({
  open,
  secondsRemaining,
  onStaySignedIn,
  onSignOut,
}: SessionTimeoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onStaySignedIn()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session expiring soon</DialogTitle>
          <DialogDescription>
            You have been inactive. For your security, you will be signed out in {secondsRemaining} seconds.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
          <Button onClick={onStaySignedIn}>Stay signed in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
