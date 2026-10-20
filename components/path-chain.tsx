import { PiArrowRight } from "react-icons/pi";
import { cn } from "./cn";
import { Avatar } from "./ui";
import { avatarColor } from "./tokens";

export function PathChain({ names, className }: { names: string[]; className?: string }) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-y-2.5 rounded-2xl bg-surface-2 p-3 ring-1 ring-line", className)}>
      {names.map((name, i) => {
        const first = i === 0;
        const last = i === names.length - 1;
        return (
          <li key={`${name}-${i}`} className="flex items-center">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[12.5px] font-medium shadow-[0_1px_2px_rgb(15_17_16/0.06)]",
                first && "bg-ink text-white",
                last && !first && "bg-lime text-ink",
                !first && !last && "bg-surface text-ink ring-1 ring-line",
              )}
            >
              <Avatar name={name} size="xs" color={first ? "#d4f65a" : avatarColor(name)} />
              {name}
            </span>
            {!last && <PiArrowRight className="mx-2 size-4 shrink-0 text-muted" />}
          </li>
        );
      })}
    </ol>
  );
}
