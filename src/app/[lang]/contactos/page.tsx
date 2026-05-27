import { PageHero } from "@/components/sections/PageHero";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { LeadFormSection } from "@/components/sections/LeadFormSection";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isPt = lang === "pt";
  return {
    title: isPt
      ? "Contactos e Parcerias | Portuguese Digital Wallet"
      : "Contacts and Partnerships | Portuguese Digital Wallet",
    description: isPt
      ? "Quer implementar a PDW na sua instituição? Contacte-nos para uma demonstração personalizada."
      : "Want to implement PDW in your institution? Contact us for a personalized demonstration.",
  };
}

export default async function ContactosPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { lang } = await params;
  const { email: initialEmail } = await searchParams;
  const dict = await getDictionary(lang as Locale);
  const isPt = lang === "pt";

  return (
    <>
      <AnimatedSection>
        <PageHero
          eyebrow={isPt ? "Contactos e Parcerias" : "Contacts & Partnerships"}
          titleGradient={
            isPt
              ? "Quer implementar a PDW"
              : "Want to implement PDW"
          }
          title={
            isPt
              ? "na sua instituição?"
              : "in your institution?"
          }
          lead={
            isPt ? (
              <>
                A nossa equipa de especialistas está disponível para discutir{" "}
                <strong>pilotos institucionais</strong>, integrações e parcerias
                estratégicas. Preencha o formulário e entraremos em contacto brevemente.
              </>
            ) : (
              <>
                Our team of specialists is available to discuss{" "}
                <strong>institutional pilots</strong>, integrations and strategic
                partnerships. Fill in the form and we will be in touch shortly.
              </>
            )
          }
        />
      </AnimatedSection>
      <AnimatedSection delay={0.15}>
        <LeadFormSection dict={dict} initialEmail={initialEmail} lang={lang} />
      </AnimatedSection>
    </>
  );
}
