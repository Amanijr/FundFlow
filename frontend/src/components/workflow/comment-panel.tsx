"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { WorkflowComment } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

interface CommentPanelProps {
  comments: WorkflowComment[];
  canComment?: boolean;
  onAddComment: (body: string, visibility: "public" | "internal") => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

export function CommentPanel({
  comments,
  canComment = true,
  onAddComment,
  isSubmitting = false,
  className,
}: CommentPanelProps) {
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    await onAddComment(body.trim(), internal ? "internal" : "public");
    setBody("");
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-semibold text-foreground">Comments</h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={cn(
                "rounded-md border border-border px-3 py-2",
                comment.visibility === "internal" && "border-amber-200 bg-amber-50/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{comment.author.name}</p>
                {comment.visibility === "internal" && (
                  <span className="text-[10px] font-medium uppercase text-amber-700">Internal</span>
                )}
              </div>
              <p className="mt-1 text-sm text-foreground">{comment.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {canComment && (
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="workflow-comment">Add comment</Label>
            <Textarea
              id="workflow-comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Add a note for approvers or the requestor"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="internal-note" checked={internal} onCheckedChange={setInternal} />
            <Label htmlFor="internal-note" className="text-sm font-normal">
              Internal note (approvers only)
            </Label>
          </div>
          <Button type="submit" size="sm" disabled={!body.trim() || isSubmitting}>
            Post comment
          </Button>
        </form>
      )}
    </div>
  );
}
