import LoadingSkeleton from "@/components/magazine/LoadingSkeleton";
import { Container, Section } from "@/components/layout";

export default function Loading() {
  return (
    <Section variant="hero" bg="white">
      <Container size="lg">
        <LoadingSkeleton />
      </Container>
    </Section>
  );
}
