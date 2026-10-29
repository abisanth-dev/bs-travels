import { Container } from "@/components/layout/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[80vh] flex-col justify-center pt-[var(--header-h)]">
      <p className="eyebrow">Page not found</p>
      <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.6rem,6vw,5rem)] leading-[1.02]">This page doesn’t seem to exist.</h1>
      <p className="mt-6 max-w-xl text-lg text-ivory-dim">The page may have moved when we rebuilt our website. Try one of these instead.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <LinkButton href="/">Home</LinkButton>
        <LinkButton href="/services" variant="secondary">
          Services
        </LinkButton>
        <LinkButton href="/contact" variant="secondary">
          Contact
        </LinkButton>
      </div>
    </Container>
  );
}
