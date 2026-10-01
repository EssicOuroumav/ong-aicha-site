"use client";

import type { ReactNode } from "react";
import type { FormState } from "@/actions/forms";

export function Field({ label, name, required, optional, children, error }: { label: string; name: string; required?: boolean; optional?: string; children: ReactNode; error?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-green-900">
        {label} {required ? <span aria-hidden className="text-red-600">*</span> : optional ? <span className="font-normal text-muted">({optional})</span> : null}
      </label>
      {children}
      {error && <p role="alert" className="mt-1 text-sm text-red-700">⚠</p>}
    </div>
  );
}

export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function FormMessage({ state, success, errors }: { state: FormState | null; success: string; errors: { validation: string; rate: string; server: string } }) {
  if (!state) return null;
  if (state.ok) return <p role="status" className="rounded-xl bg-green-100 p-4 font-medium text-green-900">{success}</p>;
  return <p role="alert" className="rounded-xl bg-red-50 p-4 font-medium text-red-800">{state.error ? errors[state.error] : errors.server}</p>;
}
