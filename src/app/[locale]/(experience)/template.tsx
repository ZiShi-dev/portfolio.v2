import { PageTransition } from "@/components/page-transition";

export default function ExperienceTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
