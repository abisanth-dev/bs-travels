"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { courses } from "@/content/courses";
import { destinations, getDestination } from "@/content/destinations";
import { enquiryText, handoffLinks } from "@/lib/forms/handoff";
import { enquirySchema, fieldErrors } from "@/lib/forms/schemas";
import { enquiryTopics, topicLabel, type EnquiryTopicId } from "@/lib/forms/topics";
import { ConsentCheckbox, Honeypot, SelectField, TextArea, TextField } from "./Fields";
import { ErrorNotice, errorMessage, HandoffPanel, postForm, SuccessPanel, type SendState } from "./Outcome";

type Step = "service" | "destination" | "details" | "review";

type Data = {
  topic: EnquiryTopicId | "";
  destination: string;
  otherDestination: string;
  course: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  website: string;
};

export function EnquiryFlow({
  configured,
  initial,
  compact = false,
}: {
  configured: boolean;
  initial?: { topic?: string; destination?: string; course?: string };
  compact?: boolean;
}) {
  const uid = useId();
  const startedAt = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const initialTopic = enquiryTopics.find((t) => t.id === initial?.topic)?.id ?? (initial?.course ? "language-course" : "");
  const initialDest = initial?.destination && getDestination(initial.destination) ? initial.destination : "";
  const [data, setData] = useState<Data>({
    topic: initialTopic,
    destination: initialDest,
    otherDestination: "",
    course: courses.some((c) => c.slug === initial?.course) ? initial!.course! : "",
    name: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
    website: "",
  });
  const [step, setStep] = useState<Step>(initialTopic ? (initialDest ? "details" : "destination") : "service");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Move focus to the step heading after each step change, for keyboard and screen reader users.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const topic = enquiryTopics.find((t) => t.id === data.topic);
  const needsDestination = Boolean(topic?.asksDestination);
  const needsCourse = data.topic === "language-course";
  const steps: Step[] = useMemo(() => {
    const s: Step[] = ["service"];
    if (needsDestination || needsCourse) s.push("destination");
    s.push("details", "review");
    return s;
  }, [needsDestination, needsCourse]);
  const index = Math.max(0, steps.indexOf(step));

  const set = <K extends keyof Data>(key: K, value: Data[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const destinationValue =
    data.destination === "other" ? data.otherDestination.trim() : data.destination === "unsure" ? "Not sure yet" : data.destination;

  const payload = {
    topic: data.topic,
    destination: needsDestination ? destinationValue : "",
    course: needsCourse ? data.course : "",
    name: data.name,
    phone: data.phone,
    email: data.email,
    message: data.message,
    consent: data.consent,
    website: data.website,
    startedAt: startedAt.current,
  };

  function validate(current: Step) {
    const e: Record<string, string> = {};
    if (current === "service" && !data.topic) e.topic = "Please choose what you need help with.";
    if (current === "destination") {
      if (needsDestination && !data.destination) e.destination = "Please choose a destination, or select Not sure yet.";
      if (needsDestination && data.destination === "other" && data.otherDestination.trim().length < 2)
        e.otherDestination = "Please tell us where you would like to go.";
      if (needsCourse && !data.course) e.course = "Please choose a course.";
    }
    if (current === "details" || current === "review") {
      const r = enquirySchema
        .pick({ name: true, phone: true, email: true, message: true })
        .safeParse({ name: data.name, phone: data.phone, email: data.email, message: data.message });
      if (!r.success) Object.assign(e, fieldErrors(r.error));
    }
    if (current === "review" && !data.consent) e.consent = "Please confirm you agree so we can contact you.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep(steps[Math.min(steps.length - 1, index + 1)]);
  }
  function back() {
    setStep(steps[Math.max(0, index - 1)]);
  }

  const text = enquiryText({ ...payload, topic: data.topic || "general" });
  const links = handoffLinks(`Enquiry: ${topicLabel(data.topic)}`, text);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step !== "review") {
      next();
      return;
    }
    if (!validate("review")) return;
    if (!configured) {
      setSend({ status: "handoff", reason: "not_configured" });
      return;
    }
    setSend({ status: "sending" });
    const result = await postForm("/api/enquiry", payload);
    if (result.ok) {
      setSend({ status: "sent" });
      return;
    }
    if (result.reason === "not_configured") {
      setSend({ status: "handoff", reason: "not_configured" });
      return;
    }
    if (result.reason === "invalid" && "errors" in result && result.errors) {
      setErrors(result.errors);
      setStep("details");
      setSend({ status: "idle" });
      return;
    }
    setSend({ status: "error", message: errorMessage(result.reason) });
  }

  if (send.status === "sent") {
    return (
      <SuccessPanel title="Thank you. We have received your enquiry.">
        <p>
          Our team will reply using the phone number or email you gave us, usually during office hours (Monday to Friday, 9 AM to
          5 PM, and Saturday half day).
        </p>
      </SuccessPanel>
    );
  }

  if (send.status === "handoff") {
    return (
      <HandoffPanel
        links={links}
        title="Your enquiry is ready to send"
        intro="Online sending is not switched on yet, so we have prepared your enquiry for WhatsApp or email. Choose one to open it with everything filled in."
      />
    );
  }

  const stepTitle: Record<Step, string> = {
    service: "What can we help with?",
    destination: needsCourse ? "Which course?" : "Where are you thinking of going?",
    details: "How can we reach you?",
    review: "Review your enquiry",
  };

  return (
    <form onSubmit={submit} noValidate className="relative" aria-describedby={`${uid}-progress`}>
      <Honeypot value={data.website} onChange={(v) => set("website", v)} />
      <ol id={`${uid}-progress`} className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Enquiry steps">
        {steps.map((s, i) => (
          <li
            key={s}
            aria-current={s === step ? "step" : undefined}
            className={`flex items-center gap-2 ${i === index ? "text-ivory" : i < index ? "text-ivory-dim" : "text-ivory-faint"}`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                i < index ? "border-gold bg-gold text-night" : i === index ? "border-gold text-gold" : "border-line-strong"
              }`}
            >
              {i < index ? <Icon name="check" size={14} strokeWidth={2.2} /> : i + 1}
            </span>
            {{ service: "Service", destination: needsCourse ? "Course" : "Destination", details: "Your details", review: "Review" }[s]}
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className={`font-display mt-10 outline-none ${compact ? "text-3xl" : "text-3xl sm:text-4xl"}`}>
        {stepTitle[step]}
      </h2>

      <div className="mt-8">
        {step === "service" ? (
          <fieldset>
            <legend className="sr-only">Choose a service</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {enquiryTopics.map((t) => {
                const on = data.topic === t.id;
                return (
                  <label
                    key={t.id}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                      on ? "border-gold bg-gold/10" : "border-line-strong hover:border-ivory/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={t.id}
                      checked={on}
                      onChange={() => set("topic", t.id)}
                      className="h-4 w-4 accent-[var(--color-gold)]"
                    />
                    <span>{t.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.topic ? <p className="mt-3 text-sm text-danger">{errors.topic}</p> : null}
          </fieldset>
        ) : null}

        {step === "destination" && needsCourse ? (
          <SelectField id={`${uid}-course`} label="Course" required value={data.course} error={errors.course} onChange={(e) => set("course", e.target.value)}>
            <option value="">Choose a course</option>
            {courses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </SelectField>
        ) : null}

        {step === "destination" && needsDestination ? (
          <div className="space-y-5">
            <SelectField
              id={`${uid}-destination`}
              label="Destination"
              required
              value={data.destination}
              error={errors.destination}
              onChange={(e) => set("destination", e.target.value)}
              hint="Destinations are where we receive enquiries for. Our office is in Jaffna."
            >
              <option value="">Choose a destination</option>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
              <option value="other">Somewhere else</option>
              <option value="unsure">Not sure yet</option>
            </SelectField>
            {data.destination === "other" ? (
              <TextField
                id={`${uid}-other`}
                label="Where would you like to go?"
                required
                value={data.otherDestination}
                error={errors.otherDestination}
                onChange={(e) => set("otherDestination", e.target.value)}
                maxLength={80}
              />
            ) : null}
          </div>
        ) : null}

        {step === "details" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id={`${uid}-name`} label="Full name" required autoComplete="name" value={data.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
            <TextField
              id={`${uid}-phone`}
              label="Phone or WhatsApp number"
              required
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+94 77 123 4567"
              value={data.phone}
              error={errors.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <div className="sm:col-span-2">
              <TextField
                id={`${uid}-email`}
                label="Email"
                required
                type="email"
                autoComplete="email"
                value={data.email}
                error={errors.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <TextArea
                id={`${uid}-message`}
                label="Your enquiry"
                required
                hint="For example: who is travelling, when, and the purpose of the trip."
                value={data.message}
                error={errors.message}
                onChange={(e) => set("message", e.target.value)}
                maxLength={2000}
              />
            </div>
          </div>
        ) : null}

        {step === "review" ? (
          <div className="space-y-6">
            <dl className="divide-y divide-line rounded-2xl border border-line-strong">
              {[
                ["Service", topicLabel(data.topic), "service"],
                ...(needsCourse ? [["Course", courses.find((c) => c.slug === data.course)?.name ?? "", "destination"]] : []),
                ...(needsDestination
                  ? [["Destination", data.destination === "other" ? data.otherDestination : data.destination === "unsure" ? "Not sure yet" : getDestination(data.destination)?.name ?? "", "destination"]]
                  : []),
                ["Name", data.name, "details"],
                ["Phone", data.phone, "details"],
                ["Email", data.email, "details"],
                ["Enquiry", data.message, "details"],
              ].map(([k, v, s]) => (
                <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr_auto] sm:gap-4">
                  <dt className="text-sm text-ivory-faint">{k}</dt>
                  <dd className="whitespace-pre-line break-words text-ivory">{v}</dd>
                  <dd>
                    <button type="button" onClick={() => setStep(s as Step)} className="text-sm text-gold underline-offset-4 hover:underline">
                      Edit<span className="sr-only"> {k}</span>
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
            <ConsentCheckbox id={`${uid}-consent`} checked={data.consent} onChange={(v) => set("consent", v)} error={errors.consent} />
            {!configured ? (
              <p className="rounded-2xl border border-line-strong p-4 text-sm leading-relaxed text-ivory-dim">
                Online sending is not switched on yet. When you continue, your enquiry will be prepared for WhatsApp or email so you
                can send it to us yourself.
              </p>
            ) : null}
            {send.status === "error" ? <ErrorNotice message={send.message} /> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {index > 0 ? (
          <button type="button" onClick={back} className={buttonClass("secondary")}>
            <Icon name="arrow-left" size={18} /> Back
          </button>
        ) : null}
        <button type="submit" className={buttonClass("primary")} disabled={send.status === "sending"} aria-busy={send.status === "sending"}>
          {send.status === "sending" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-night/30 border-t-night" aria-hidden /> Sending…
            </>
          ) : step === "review" ? (
            configured ? (
              <>
                Send enquiry <Icon name="arrow-right" size={18} />
              </>
            ) : (
              <>
                Continue to WhatsApp or email <Icon name="arrow-right" size={18} />
              </>
            )
          ) : (
            <>
              Continue <Icon name="arrow-right" size={18} />
            </>
          )}
        </button>
      </div>
      {send.status === "error" ? (
        <div className="mt-8">
          <HandoffPanel
            links={links}
            autoFocus={false}
            title="Prefer to send it another way?"
            intro="Your enquiry is filled in and ready. Open it in WhatsApp or your email app and press send."
          />
        </div>
      ) : null}
    </form>
  );
}
