interface AccountLabelProps {
  name: string;
  code?: string | null;
}

/** Show the account people recognize; keep the bookkeeping number quiet. */
export function AccountLabel({ name, code }: AccountLabelProps) {
  return (
    <span className="flex flex-col">
      <span>{name}</span>
      {code ? <span className="text-xs text-muted-foreground">{code}</span> : null}
    </span>
  );
}

export function accountOptionLabel(name: string, code?: string | null) {
  return name || code || "Account";
}
