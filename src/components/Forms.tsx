"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { Field, FormMessage, Honeypot } from "./FormKit";
import { submitContact, submitDonation, submitHelp, submitJoin, submitSponsorship, type FormState } from "@/actions/forms";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/** Soumission sans réinitialisation automatique : le visiteur garde sa saisie en cas d'erreur, le formulaire est vidé après un succès. */
function useServerForm(serverAction: (prev: FormState | null, form: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState<FormState | null, FormData>(serverAction, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const formProps = {
    ref,
    noValidate: true,
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      startTransition(() => dispatch(data));
    },
  };
  return { state, pending, formProps };
}

type Errors = { validation: string; rate: string; server: string };
const errorsOf = (t: Dictionary): Errors => ({
  validation: t.common.required + " ✱",
  rate: t.common.error,
  server: t.common.error,
});

function Consent({ t }: { t: Dictionary }) {
  return (
    <label className="flex items-start gap-3 text-sm text-muted">
      <input type="checkbox" name="consent" required className="mt-1 h-5 w-5 shrink-0 accent-green-700" />
      <span>{t.common.consent}</span>
    </label>
  );
}

function Submit({ pending, label, busy }: { pending: boolean; label: string; busy: string }) {
  return <button type="submit" disabled={pending} className="btn btn-primary w-full sm:w-auto">{pending ? busy : label}</button>;
}

export function ContactForm({ t }: { t: Dictionary }) {
  const { state, pending, formProps } = useServerForm(submitContact);
  const bad = (n: string) => state?.fields?.includes(n);
  return (
    <form {...formProps} className="relative space-y-5">
      <Honeypot />
      <Field label={t.contact.name} name="name" required error={bad("name")} errorText={t.common.invalid}><input id="name" name="name" required autoComplete="name" className="field" /></Field>
      <Field label={t.contact.email} name="email" required error={bad("email")} errorText={t.common.invalid}><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
      <Field label={t.contact.subject} name="subject" optional={t.common.optional}><input id="subject" name="subject" className="field" /></Field>
      <Field label={t.contact.message} name="message" required error={bad("message")} errorText={t.common.invalid}><textarea id="message" name="message" rows={6} required className="field" /></Field>
      <Consent t={t} />
      <Submit pending={pending} label={t.common.send} busy={t.common.sending} />
      <FormMessage state={state} success={t.contact.success} errors={errorsOf(t)} />
    </form>
  );
}

export function JoinForm({ t }: { t: Dictionary }) {
  const { state, pending, formProps } = useServerForm(submitJoin);
  const bad = (n: string) => state?.fields?.includes(n);
  return (
    <form {...formProps} className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.join.firstName} name="firstName" required error={bad("firstName")} errorText={t.common.invalid}><input id="firstName" name="firstName" required autoComplete="given-name" className="field" /></Field>
        <Field label={t.join.lastName} name="lastName" required error={bad("lastName")} errorText={t.common.invalid}><input id="lastName" name="lastName" required autoComplete="family-name" className="field" /></Field>
        <Field label={t.join.phone} name="phone" required error={bad("phone")} errorText={t.common.invalid}><input id="phone" name="phone" type="tel" required autoComplete="tel" dir="ltr" className="field" /></Field>
        <Field label={t.join.email} name="email" optional={t.common.optional} error={bad("email")} errorText={t.common.invalid}><input id="email" name="email" type="email" autoComplete="email" className="field" /></Field>
        <Field label={t.join.city} name="city" optional={t.common.optional}><input id="city" name="city" className="field" /></Field>
        <Field label={t.join.type} name="type" required>
          <select id="type" name="type" className="field" defaultValue="MEMBER">
            <option value="MEMBER">{t.join.types.MEMBER}</option>
            <option value="VOLUNTEER">{t.join.types.VOLUNTEER}</option>
          </select>
        </Field>
      </div>
      <Field label={t.join.message} name="message"><textarea id="message" name="message" rows={4} className="field" /></Field>
      <Consent t={t} />
      <Submit pending={pending} label={t.join.submit} busy={t.common.sending} />
      <FormMessage state={state} success={t.join.success} errors={errorsOf(t)} />
    </form>
  );
}

export function SponsorForm({ t }: { t: Dictionary }) {
  const { state, pending, formProps } = useServerForm(submitSponsorship);
  const bad = (n: string) => state?.fields?.includes(n);
  return (
    <form {...formProps} className="relative space-y-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.sponsor.name} name="fullName" required error={bad("fullName")} errorText={t.common.invalid}><input id="fullName" name="fullName" required autoComplete="name" className="field" /></Field>
        <Field label={t.sponsor.email} name="email" required error={bad("email")} errorText={t.common.invalid}><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
        <Field label={t.sponsor.phone} name="phone" required error={bad("phone")} errorText={t.common.invalid}><input id="phone" name="phone" type="tel" required autoComplete="tel" dir="ltr" className="field" /></Field>
        <Field label={t.sponsor.country} name="country" optional={t.common.optional}><input id="country" name="country" className="field" /></Field>
        <Field label={t.sponsor.children} name="children" required error={bad("children")} errorText={t.common.invalid}><input id="children" name="children" type="number" min={1} max={50} defaultValue={1} required className="field" /></Field>
        <Field label={t.sponsor.frequency} name="frequency" required>
          <select id="frequency" name="frequency" defaultValue="MONTHLY" className="field">
            {(["MONTHLY", "QUARTERLY", "YEARLY"] as const).map((f) => <option key={f} value={f}>{t.sponsor.frequencies[f]}</option>)}
          </select>
        </Field>
      </div>
      <Field label={t.sponsor.note} name="note"><textarea id="note" name="note" rows={3} className="field" /></Field>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="confirm" required className="mt-1 h-5 w-5 accent-green-700" />
        <span>{t.sponsor.confirm}</span>
      </label>
      <Consent t={t} />
      <Submit pending={pending} label={t.sponsor.submit} busy={t.common.sending} />
      <FormMessage state={state} success={t.sponsor.success} errors={errorsOf(t)} />
    </form>
  );
}

const presets = [2000, 5000, 10000, 25000, 50000];

export function DonateForm({ t, lang, initialCause = "general", manual = false }: { t: Dictionary; lang: Locale; initialCause?: string; manual?: boolean }) {
  const { state, pending, formProps } = useServerForm(submitDonation);
  const [amount, setAmount] = useState<number>(10000);
  const bad = (n: string) => state?.fields?.includes(n);
  const fmt = (n: number) => new Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : lang === "en" ? "en-GB" : "fr-FR").format(n);
  return (
    <form {...formProps} className="relative space-y-6">
      <Honeypot />
      <input type="hidden" name="lang" value={lang} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-green-900">{t.donate.chooseAmount}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {presets.map((p) => (
            <button type="button" key={p} aria-pressed={amount === p} onClick={() => setAmount(p)}
              className={`rounded-xl border-2 px-2 py-3 font-bold transition ${amount === p ? "border-green-700 bg-green-700 text-white" : "border-line bg-white text-green-800 hover:border-green-600"}`}>
              {fmt(p)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label htmlFor="amount" className="mb-1.5 block text-sm font-semibold text-green-900">{t.donate.otherAmount}</label>
          <input id="amount" name="amount" type="number" min={500} step={100} value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} dir="ltr" required className="field" />
          {(bad("amount") || (amount > 0 && amount < 500)) && <p role="alert" className="mt-1 text-sm text-red-700">{t.donate.minAmount}</p>}
        </div>
      </fieldset>
      <Field label={t.donate.cause} name="cause">
        <select id="cause" name="cause" className="field" defaultValue={initialCause}>
          {(Object.keys(t.donate.causes) as (keyof typeof t.donate.causes)[]).map((k) => <option key={k} value={k}>{t.donate.causes[k]}</option>)}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.donate.name} name="donorName" required error={bad("donorName")} errorText={t.common.invalid}><input id="donorName" name="donorName" required autoComplete="name" className="field" /></Field>
        <Field label={t.donate.email} name="email" required error={bad("email")} errorText={t.common.invalid}><input id="email" name="email" type="email" required autoComplete="email" className="field" /></Field>
        <Field label={t.donate.phone} name="phone" optional={t.common.optional} error={bad("phone")} errorText={t.common.invalid}><input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" className="field" /></Field>
        <Field label={t.donate.country} name="country" optional={t.common.optional}><input id="country" name="country" className="field" /></Field>
      </div>
      <Field label={t.donate.message} name="message"><textarea id="message" name="message" rows={3} className="field" /></Field>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="anonymous" className="h-5 w-5 accent-green-700" />{t.donate.anonymous}</label>
      <Consent t={t} />
      <button type="submit" disabled={pending || amount < 500} className="btn btn-gold w-full text-lg !py-4">
        {pending ? t.common.sending : `${t.donate.submit} · ${fmt(amount || 0)} FCFA`}
      </button>
      <p className="text-center text-sm text-muted">{manual ? t.donate.manualSecure : `🔒 ${t.donate.secure}`}</p>
      <FormMessage state={state} success="" errors={errorsOf(t)} />
    </form>
  );
}

export function HelpForm({ t }: { t: Dictionary }) {
  const { state, pending, formProps } = useServerForm(submitHelp);
  const bad = (n: string) => state?.fields?.includes(n);
  return (
    <form {...formProps} className="relative space-y-5">
      <Honeypot />
      <Field label={t.help.kind} name="kind" required>
        <select id="kind" name="kind" className="field" defaultValue="SOS">
          {(["SOS", "WIDOW", "OTHER"] as const).map((k) => <option key={k} value={k}>{t.help.kinds[k]}</option>)}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.help.name} name="name" required error={bad("name")} errorText={t.common.invalid}><input id="name" name="name" required autoComplete="name" className="field" /></Field>
        <Field label={t.help.phone} name="phone" required error={bad("phone")} errorText={t.common.invalid}><input id="phone" name="phone" type="tel" required autoComplete="tel" dir="ltr" className="field" /></Field>
      </div>
      <Field label={t.help.email} name="email" optional={t.common.optional} error={bad("email")} errorText={t.common.invalid}><input id="email" name="email" type="email" autoComplete="email" className="field" /></Field>
      <Field label={t.help.nature} name="nature" required error={bad("nature")} errorText={t.common.invalid}><input id="nature" name="nature" required className="field" /></Field>
      <Field label={t.help.message} name="message"><textarea id="message" name="message" rows={4} className="field" /></Field>
      <Consent t={t} />
      <Submit pending={pending} label={t.help.submit} busy={t.common.sending} />
      <FormMessage state={state} success={t.help.success} errors={errorsOf(t)} />
    </form>
  );
}
