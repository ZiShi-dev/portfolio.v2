import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("grid w-full min-w-0 gap-1.5", className)}>
      <label
        htmlFor={id}
        className="break-words text-sm font-medium text-foreground/75"
      >
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="break-words text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="break-words text-xs leading-relaxed text-foreground/50"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
