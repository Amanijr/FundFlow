"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PermissionGate } from "@/components/security/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  assignMinistryMember,
  listMemberMinistries,
  listMinistries,
  removeMinistryMember,
} from "@/lib/api/church";
import { formatDate } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";

interface MemberMinistriesPanelProps {
  memberId: number;
  accessToken: string;
}

export function MemberMinistriesPanel({ memberId, accessToken }: MemberMinistriesPanelProps) {
  const queryClient = useQueryClient();
  const [ministryId, setMinistryId] = useState("");
  const [role, setRole] = useState("");

  const assignmentsQuery = useQuery({
    queryKey: ["members", memberId, "ministries"],
    queryFn: async () => (await listMemberMinistries(accessToken, memberId)).data,
  });

  const ministriesQuery = useQuery({
    queryKey: ["church", "ministries"],
    queryFn: async () => (await listMinistries(accessToken)).data,
  });

  const activeMinistryIds = useMemo(
    () =>
      new Set(
        (assignmentsQuery.data ?? [])
          .filter((row) => row.status === "ACTIVE")
          .map((row) => row.ministryId),
      ),
    [assignmentsQuery.data],
  );

  const availableMinistries = (ministriesQuery.data ?? []).filter(
    (ministry) => ministry.active && !activeMinistryIds.has(ministry.id),
  );

  const assignMutation = useMutation({
    mutationFn: () =>
      assignMinistryMember(accessToken, Number(ministryId), {
        memberId,
        role: role.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Ministry added");
      setMinistryId("");
      setRole("");
      await queryClient.invalidateQueries({ queryKey: ["members", memberId, "ministries"] });
      await queryClient.invalidateQueries({ queryKey: ["church", "ministries"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to add ministry");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (assignment: { id: number; ministryId: number }) =>
      removeMinistryMember(accessToken, assignment.ministryId, assignment.id),
    onSuccess: async () => {
      toast.success("Removed from ministry");
      await queryClient.invalidateQueries({ queryKey: ["members", memberId, "ministries"] });
      await queryClient.invalidateQueries({ queryKey: ["church", "ministries"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to remove ministry");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ministries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              if (!ministryId) {
                toast.error("Choose a ministry");
                return;
              }
              assignMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="member-ministry">Add to ministry</Label>
              <select
                id="member-ministry"
                className="flex h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
                value={ministryId}
                onChange={(event) => setMinistryId(event.target.value)}
              >
                <option value="">Select a ministry</option>
                {availableMinistries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-role">Role</Label>
              <Input
                id="member-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Volunteer"
              />
            </div>
            <Button type="submit" disabled={assignMutation.isPending}>
              Add
            </Button>
          </form>
        </PermissionGate>

        {(assignmentsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Not assigned to a ministry yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(assignmentsQuery.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <Link
                    href={`/church/ministries/${row.ministryId}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {row.ministryName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {row.role || "Member"}
                    {row.joinedAt ? ` · joined ${formatDate(row.joinedAt)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={row.status === "ACTIVE" ? "success" : "secondary"}>{row.status}</Badge>
                  {row.status === "ACTIVE" ? (
                    <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={removeMutation.isPending}
                        onClick={() => removeMutation.mutate({ id: row.id, ministryId: row.ministryId })}
                      >
                        Remove
                      </Button>
                    </PermissionGate>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
