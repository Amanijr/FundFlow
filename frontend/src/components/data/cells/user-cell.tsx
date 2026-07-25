import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface UserCellProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  compact?: boolean;
  className?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function UserCell({ name, email, avatarUrl, compact = false, className }: UserCellProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Avatar className={cn(compact ? "h-7 w-7" : "h-8 w-8")}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
        <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
      </Avatar>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
        </div>
      )}
    </div>
  );
}
