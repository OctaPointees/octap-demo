import { Field } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { Tabs } from "@base-ui/react/tabs";
import { Check, Copy, ArrowSquareOut } from "phosphor-react";
import { useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { shortHash } from "../../utils/format";

/* ---------------------------------------------------------------- Segmented */

type SegmentedProps<T extends string> = {
  value: T;
  onValueChange: (v: T) => void;
  options: { label: ReactNode; value: T }[];
  size?: "sm" | "md";
  className?: string;
};

/** Pill-style tab bar (Base UI Tabs), used for ranges and view switches. */
export function Segmented<T extends string>({ value, onValueChange, options, size = "sm", className }: SegmentedProps<T>) {
  return (
    <Tabs.Root value={value} onValueChange={(v) => onValueChange(v as T)} className={className}>
      <Tabs.List className="relative z-0 inline-flex gap-1 rounded-field bg-base-200 p-1">
        {options.map((o) => (
          <Tabs.Tab
            key={o.value}
            value={o.value}
            className={cn(
              "cursor-pointer rounded-field px-3 font-medium whitespace-nowrap opacity-60 outline-none transition-opacity select-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary data-active:opacity-100",
              size === "sm" ? "h-7 text-xs" : "h-9 text-sm",
            )}
          >
            {o.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator className="absolute top-1/2 left-0 -z-1 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-field bg-base-100 shadow-sm transition-all duration-200" />
      </Tabs.List>
    </Tabs.Root>
  );
}

/* ------------------------------------------------------------------- Switch */

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
};

export function Switch({ checked, onCheckedChange, disabled, label, description }: SwitchProps) {
  return (
    <label className={cn("flex items-center justify-between gap-4", disabled ? "opacity-50" : "cursor-pointer")}>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium">{label}</span>}
          {description && <span className="block text-xs opacity-60">{description}</span>}
        </span>
      )}
      <BaseSwitch.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={(c) => onCheckedChange(c)}
        className="relative flex h-6 w-11 shrink-0 rounded-full bg-base-300 p-0.5 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-checked:bg-primary"
      >
        <BaseSwitch.Thumb className="size-5 rounded-full bg-base-100 shadow transition-transform duration-150 data-checked:translate-x-5" />
      </BaseSwitch.Root>
    </label>
  );
}

/* ---------------------------------------------------------------- FormField */

type FieldProps = {
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  name?: string;
};

/**
 * Base UI Field wrapper; server-side (mock) errors are shown via `error`.
 * We deliberately don't set `invalid` on Field.Root: Base UI's Form blocks
 * submission while a field is invalid, which would prevent resubmitting
 * after the (mock) API rejects a value.
 */
export function FormField({ label, error, hint, children, className, name }: FieldProps) {
  return (
    <Field.Root name={name} className={cn("flex flex-col gap-1", className)}>
      <Field.Label className="text-sm font-medium">{label}</Field.Label>
      {children}
      {error ? (
        <Field.Error match className="text-xs text-error">
          {error}
        </Field.Error>
      ) : (
        hint && <Field.Description className="text-xs opacity-60">{hint}</Field.Description>
      )}
    </Field.Root>
  );
}

/** Input that participates in the surrounding Base UI Field (label/aria wiring). */
export function TextInput({ className, invalid, ...props }: React.ComponentProps<typeof Field.Control> & { invalid?: boolean }) {
  return <Field.Control {...props} aria-invalid={invalid || undefined} className={cn("input w-full", invalid && "input-error", className as string)} />;
}

/* ------------------------------------------------------------------ Copying */

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs gap-1"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      aria-label={`Copy ${label ?? "value"}`}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {label}
    </button>
  );
}

/** Sui transaction digest / object id with copy + explorer link. */
export function ChainRef({ value, kind = "tx" }: { value: string; kind?: "tx" | "object" | "account" }) {
  const href = `https://suiscan.xyz/mainnet/${kind}/${value}`;
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-xs">
      <span title={value}>{shortHash(value, kind === "tx" ? 8 : 6, 4)}</span>
      <CopyButton value={value} />
      <a href={href} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" aria-label="Open in explorer" onClick={(e) => e.stopPropagation()}>
        <ArrowSquareOut />
      </a>
    </span>
  );
}
