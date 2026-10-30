"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";

const control =
  "mt-2 block w-full rounded-2xl border bg-navy-2 px-4 py-3 text-base text-ivory placeholder:text-ivory-faint/70 transition-colors focus:border-gold focus:outline-none aria-[invalid=true]:border-danger";

function Wrap({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ivory">
        {label}
        {required ? <span className="text-gold"> *</span> : <span className="text-ivory-faint"> (optional)</span>}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ivory-faint">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-2 text-sm text-danger">
          <Icon name="info" size={16} /> {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  ...rest
}: { id: string; label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} min-h-12 border-line-strong`}
        {...rest}
      />
    </Wrap>
  );
}

export function TextArea({
  id,
  label,
  hint,
  error,
  required,
  ...rest
}: { id: string; label: string; hint?: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        name={id}
        required={required}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} border-line-strong`}
        {...rest}
      />
    </Wrap>
  );
}

export function SelectField({
  id,
  label,
  hint,
  error,
  required,
  children,
  ...rest
}: { id: string; label: string; hint?: string; error?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Wrap id={id} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          id={id}
          name={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${control} min-h-12 appearance-none border-line-strong pr-12`}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size={18} className="pointer-events-none absolute right-4 top-[calc(50%+4px)] -translate-y-1/2 text-ivory-faint" />
      </div>
    </Wrap>
  );
}

export function ConsentCheckbox({ id, checked, onChange, error }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer gap-3 text-sm leading-relaxed text-ivory-dim">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-gold)]"
        />
        <span>
          I agree that BS Travels may use the details above to contact me about this request by phone, WhatsApp or email.
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-2 text-sm text-danger">
          <Icon name="info" size={16} /> {error}
        </p>
      ) : null}
    </div>
  );
}

/** Hidden from people; bots that fill every field reveal themselves here. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
