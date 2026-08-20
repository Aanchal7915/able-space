import { cn, colorForId, initials } from "@/lib/utils";
import type { User } from "@/lib/types";

const SIZE_CLASSES = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
};

export function UserAvatar({
  user,
  size = "sm",
  className,
  ring,
}: {
  user: Pick<User, "id" | "fullName" | "avatarUrl" | "avatarColor">;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  ring?: boolean;
}) {
  const bg = user.avatarColor || colorForId(user.id);
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={cn(
          "rounded-full object-cover shrink-0",
          SIZE_CLASSES[size],
          ring && "ring-2 ring-surface",
          className
        )}
      />
    );
  }
  return (
    <div
      title={user.fullName}
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-white shrink-0 select-none",
        SIZE_CLASSES[size],
        ring && "ring-2 ring-surface",
        className
      )}
      style={{ backgroundColor: bg }}
    >
      {initials(user.fullName)}
    </div>
  );
}

export function AvatarStack({
  users,
  max = 3,
  size = "sm",
}: {
  users: Pick<User, "id" | "fullName" | "avatarUrl" | "avatarColor">[];
  max?: number;
  size?: keyof typeof SIZE_CLASSES;
}) {
  if (users.length === 0) {
    return (
      <div
        className={cn(
          "rounded-full border border-dashed border-border-strong text-muted-foreground flex items-center justify-center",
          SIZE_CLASSES[size]
        )}
      >
        <span className="text-[11px] leading-none">+</span>
      </div>
    );
  }
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((u) => (
        <UserAvatar key={u.id} user={u} size={size} ring />
      ))}
      {rest > 0 && (
        <div
          className={cn(
            "rounded-full bg-surface-sunken border-2 border-surface flex items-center justify-center text-muted-foreground font-medium",
            SIZE_CLASSES[size]
          )}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
