import type { Metadata } from "next";
import { listPosts, countPostsByType } from "@/lib/posts-db";
import { getActiveBannerEvento } from "@/lib/eventos-db";
import { FeedMural } from "@/components/atualidades/FeedMural";
import { EventoBanner } from "@/components/atualidades/EventoBanner";
import { Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isPt = lang === "pt";
  return {
    title: isPt ? "Atualidades · PDW" : "News · PDW",
    description: isPt
      ? "Vídeos, podcasts, eventos e marcos da Portuguese Digital Wallet, num só feed."
      : "Videos, podcasts, events and milestones of the Portuguese Digital Wallet, in one feed.",
    alternates: {
      canonical: `/${lang}/atualidades`,
      languages: { pt: "/pt/atualidades", en: "/en/atualidades" },
    },
  };
}

export const revalidate = 60;

export default async function AtualidadesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const posts = listPosts({ status: "published", limit: 24 });
  const counts = countPostsByType("published");
  const bannerEvento = getActiveBannerEvento();

  return (
    <>
      <FeedMural initialPosts={posts} counts={counts} lang={lang as Locale} />
      {bannerEvento && <EventoBanner evento={bannerEvento} lang={lang as Locale} />}
    </>
  );
}
