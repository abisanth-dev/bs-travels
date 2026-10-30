"use client";

import { useCallback } from "react";
import { Container } from "@/components/layout/Container";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { sceneState } from "./sceneState";
import { SceneSlot } from "./StageSlot";

/** Appointment request beside the desk scene. This is a request; the team confirms the time. */
export function AppointmentSection({ configured }: { configured: boolean }) {
  const onProgress = useCallback((appointment: { date: string; progress: number }) => sceneState.set({ appointment }), []);
  return (
    <section id="appointment" data-flight="appointment" aria-labelledby="appointment-title" className="relative isolate scroll-mt-20 py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.05fr]">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <p className="eyebrow" data-reveal>
            Consultation
          </p>
          <h2 id="appointment-title" className="font-display mt-5 text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.03]" data-reveal>
            Plan your next chapter.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-ivory-dim">
            Request an Appointment with a preferred day and time. This is a request, not a booking: our team will contact you to confirm a
            time that works.
          </p>
          <SceneSlot name="desk" className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[2rem]" posterClassName="object-cover" />
        </div>
        <div className="rounded-[2rem] border border-line bg-navy-2/60 p-6 sm:p-10">
          <AppointmentForm configured={configured} onProgress={onProgress} />
        </div>
      </Container>
    </section>
  );
}
