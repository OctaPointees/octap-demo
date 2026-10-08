import { Select as Base } from "@base-ui/react/select";
import { CaretDown, Check } from "phosphor-react";
import { cn } from "../../utils/cn";

export type SelectOption<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function Select<T extends string>({ value, onValueChange, options, className, placeholder, disabled, size = "md" }: Props<T>) {
  return (
    <Base.Root
      items={options}
      value={value}
      disabled={disabled}
      onValueChange={(v) => v !== null && onValueChange(v as T)}
    >
      <Base.Trigger
        className={cn(
          "select w-full min-w-36 cursor-pointer bg-none pr-3 outline-offset-0 focus-visible:outline-2 focus-visible:outline-primary",
          size === "sm" && "select-sm",
          className,
        )}
      >
        <Base.Value className="flex-1 truncate text-left data-placeholder:opacity-50" placeholder={placeholder} />
        <Base.Icon className="opacity-50">
          <CaretDown />
        </Base.Icon>
      </Base.Trigger>
      <Base.Portal>
        <Base.Positioner className="z-[60] outline-none" sideOffset={4} alignItemWithTrigger={false}>
          <Base.Popup className="max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg transition-[scale,opacity] duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0">
            <Base.List>
              {options.map((opt) => (
                <Base.Item
                  key={opt.value}
                  value={opt.value}
                  className="grid cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 rounded-field px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-primary/10 data-selected:font-semibold"
                >
                  <Base.ItemIndicator className="col-start-1 text-primary">
                    <Check weight="bold" />
                  </Base.ItemIndicator>
                  <Base.ItemText className="col-start-2">{opt.label}</Base.ItemText>
                </Base.Item>
              ))}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
