"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PermissionGate } from "@/components/security/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignMinistryMember, listMinistryMembers, removeMinistryMember } from "@/lib/api/church";
import { listMembers } from "@/lib/api/donors";
import { formatDate } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";

interface MinistryMembersPanelProps {
  ministryId: number;
  accessToken: string;
}

export function MinistryMembersPanel({ ministryId, accessToken }: MinistryMembersPanelProps) {
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState("");
  const [role, setRole] = useState("");

  const membersQuery = useQuery({
    queryKey: ["church", "ministries", ministryId, "members"],
    queryFn: async () => (await listMinistryMembers(accessToken, ministryId)).data,
  });

  const peopleQuery = useQuery({
    queryKey: ["people", "members"],
    queryFn: async () => (await listMembers(accessToken)).data,
  });

  const assignedIds = useMemo(
    () =>
      new Set(
        (membersQuery.data ?? [])
          .filter((row) => row.status === "ACTIVE")
          .map((row) => row.memberId),
      ),
    [membersQuery.data],
  );

  const availablePeople = (peopleQuery.data ?? []).filter((person) => !assignedIds.has(person.id));

  const assignMutation = useMutation({
    mutationFn: () =>
      assignMinistryMember(accessToken, ministryId, {
        memberId: Number(memberId),
        role: role.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Member added to ministry");
      setMemberId("");
      setRole("");
      await queryClient.invalidateQueries({ queryKey: ["church", "ministries"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to assign member");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (assignmentId: number) => removeMinistryMember(accessToken, ministryId, assignmentId),
    onSuccess: async () => {
      toast.success("Member removed from ministry");
      await queryClient.invalidateQueries({ queryKey: ["church", "ministries"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to remove member");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PermissionGate roles={["ORG_ADMIN", "FUNDRAISING_MANAGER", "FINANCE_MANAGER", "STAFF"]}>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              if (!memberId) {
                toast.error("Choose a member");
                return;
              }
              assignMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="ministry-member">Add member</Label>
              <select
                id="ministry-member"
                className="flex h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
              >
                <option value="">Select a member</option>
                {availablePeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.memberNumber ? `${person.memberNumber} · ` : ""}
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ministry-role">Role</Label>
              <Input
                id="ministry-role"
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

        {(membersQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No one is assigned to this ministry yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {(membersQuery.data ?? []).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-sm font-medium">{row.memberName}</p>
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
                        onClick={() => removeMutation.mutate(row.id)}
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
