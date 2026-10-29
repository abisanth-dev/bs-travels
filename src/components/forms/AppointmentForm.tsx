"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { appointmentText, handoffLinks } from "@/lib/forms/handoff";
import { appointmentSchema, fieldErrors } from "@/lib/forms/schemas";
import { appointmentModes, appointmentTimes, enquiryTopics, topicLabel } from "@/lib/forms/topics";
import { ConsentCheckbox, Honeypot, SelectField, TextArea, TextField } from "./Fields";
import { ErrorNotice, errorMessage, HandoffPanel, postForm, SuccessPanel, type SendState } from "./Outcome";

function localISO(d: Date) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function AppointmentForm({ configured, initialService }: { configured: boolean; initialService?: string }) {
  const uid = useId();
  const startedAt = useRef(0);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [data, setData] = useState({
    service: enquiryTopics.some((t) => t.id === initialService) ? initialService! : "",
    preferredDate: "",
    preferredTime: "",
    mode: "office",
    name: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    const now = new Date();
    setMinDate(localISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)));
    setMaxDate(localISO(new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())));
  }, []);

  const set = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const payload = { ...data, startedAt: startedAt.current };
  const links = handoffLinks(`Appointment request: ${topicLabel(data.service)}`, appointmentText(data));
  const isSaturday = data.preferredDate ? new Date(`${data.preferredDate}T00:00:00`).getDay() === 6 : false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = appointmentSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }
    if (!configured) {
      setSend({ status: "handoff", reason: "not_configured" });
      return;
    }
    setSend({ status: "sending" });
    const result = await postForm("/api/appointment", payload);
    if (result.ok) return setSend({ status: "sent" });
    if (result.reason === "not_configured") return setSend({ status: "handoff", reason: "not_configured" });
    if (result.reason === "invalid" && "errors" in result && result.errors) {
      setErrors(result.errors);
      setSend({ status: "idle" });
      return;
    }
    setSend({ status: "error", message: errorMessage(result.reason) });
  }

  if (send.status === "sent") {
    return (
      <SuccessPanel title="Request received. This is not yet a confirmed appointment.">
        <p>
          Thank you. Our team will contact you by phone or email to confirm a time that works. Until you hear from us, please treat
          your preferred date and time as a request only.
        </p>
      </SuccessPanel>
    );
  }
  if (send.status === "handoff") {
    return (
      <HandoffPanel
        links={links}
        title="Your appointment request is ready to send"
        intro="Online sending is not switched on yet, so we have prepared your request for WhatsApp or email. The team will reply to confirm a time."
      />
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={submit} noValidate className="relative space-y-6">
      <Honeypot value={data.website} onChange={(v) => set("website", v)} />
      {errorCount ? (
        <div ref={errorSummary} tabIndex={-1} role="alert" className="rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm outline-none">
          Please check {errorCount === 1 ? "1 field" : `${errorCount} fields`} below.
        </div>
      ) : null}

      <SelectField id={`${uid}-service`} label="Service" required value={data.service} error={errors.service} onChange={(e) => set("service", e.target.value)}>
        <option value="">Choose a service</option>
        {enquiryTopics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={`${uid}-date`}
          label="Preferred date"
          required
          type="date"
          min={minDate}
          max={maxDate}
          value={data.preferredDate}
          error={errors.preferredDate}
          hint="Monday to Saturday. We are closed on Sundays."
          onChange={(e) => set("preferredDate", e.target.value)}
        />
        <SelectField
          id={`${uid}-time`}
          label="Preferred time"
          required
          value={data.preferredTime}
          error={errors.preferredTime}
          hint={isSaturday ? "Saturday is a half day. The team will confirm a time that fits." : "The team will confirm the exact time."}
          onChange={(e) => set("preferredTime", e.target.value)}
        >
          <option value="">Choose a time</option>
          {appointmentTimes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </SelectField>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ivory">
          How would you like to meet? <span className="text-gold">*</span>
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {appointmentModes.map((m) => (
            <label
              key={m.id}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 ${
                data.mode === m.id ? "border-gold bg-gold/10" : "border-line-strong"
              }`}
            >
              <input type="radio" name="mode" value={m.id} checked={data.mode === m.id} onChange={() => set("mode", m.id)} className="h-4 w-4 accent-[var(--color-gold)]" />
              {m.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField id={`${uid}-name`} label="Full name" required autoComplete="name" value={data.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
        <TextField
          id={`${uid}-phone`}
          label="Phone or WhatsApp number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={data.phone}
          error={errors.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
      </div>
      <TextField id={`${uid}-email`} label="Email" required type="email" autoComplete="email" value={data.email} error={errors.email} onChange={(e) => set("email", e.target.value)} />
      <TextArea
        id={`${uid}-message`}
        label="Message"
        hint="Anything that helps us prepare, such as the destination or documents you already have."
        value={data.message}
        error={errors.message}
        onChange={(e) => set("message", e.target.value)}
        maxLength={2000}
      />
      <ConsentCheckbox id={`${uid}-consent`} checked={data.consent} onChange={(v) => set("consent", v)} error={errors.consent} />

      {send.status === "error" ? <ErrorNotice message={send.message} /> : null}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button type="submit" className={buttonClass("primary")} disabled={send.status === "sending"} aria-busy={send.status === "sending"}>
          {send.status === "sending" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-night/30 border-t-night" aria-hidden /> Sending…
            </>
          ) : configured ? (
            <>
              <Icon name="calendar" size={18} /> Request an Appointment
            </>
          ) : (
            <>
              <Icon name="calendar" size={18} /> Request via WhatsApp or email
            </>
          )}
        </button>
        <p className="text-sm text-ivory-faint">This sends a request. The team will contact you to confirm the time.</p>
      </div>
      {send.status === "error" ? (
        <HandoffPanel autoFocus={false} links={links} title="Prefer to send it another way?" intro="Your request is filled in and ready in WhatsApp or email." />
      ) : null}
    </form>
  );
}
