"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DelegatePayload } from "@/types/workflow-instance";

interface DelegationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DelegatePayload) => Promise<void>;
  isSubmitting?: boolean;
}

export function DelegationDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: DelegationDialogProps) {
  const [delegateUserId, setDelegateUserId] = useState("3");
  const [effectiveFrom, setEffectiveFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [effectiveTo, setEffectiveTo] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  );
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delegate approval</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delegate-user">Delegate to (user ID)</Label>
            <Input
              id="delegate-user"
              value={delegateUserId}
              onChange={(event) => setDelegateUserId(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="effective-from">Effective from</Label>
              <Input
                id="effective-from"
                type="date"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective-to">Effective to</Label>
              <Input
                id="effective-to"
                type="date"
                value={effectiveTo}
                onChange={(event) => setEffectiveTo(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delegate-reason">Reason</Label>
            <Textarea
              id="delegate-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why are you delegating?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!reason.trim() || isSubmitting}
            onClick={() =>
              void onSubmit({
                delegateUserId: Number(delegateUserId),
                effectiveFrom,
                effectiveTo,
                reason: reason.trim(),
              }).then(() => onOpenChange(false))
            }
          >
            Delegate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
