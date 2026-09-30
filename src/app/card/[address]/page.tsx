import type { Metadata } from "next";
import { cache, type CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Candles } from "@/components/Candles";
import { ReportCardView } from "@/components/ReportCardView";
import { ShareBar } from "@/components/ShareBar";
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";
import { loadReportCard } from "@/lib/load";
import { isAddress } from "@/lib/providers";
import { hashString } from "@/lib/random";
import { shortAddress } from "@/lib/reportCard";
import {
  gradeLine,
  shareText,
  statusLines,
  statusTone,
  tickerItems,
  widestWord,
  worstSubject,
  xIntentUrl,
} from "@/lib/share";
import { siteOrigin } from "../../site";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ name?: string; term?: string }>;
};

/** One provider fetch per request, shared by generateMetadata and the page. */
const getCard = cache((address: string, name?: string, term?: string) =>
  loadReportCard(address, { name, term }),
);

function cardQuery(sp: { name?: string; term?: string }) {
  const q = new URLSearchParams();
  if (sp.name) q.set("name", sp.name);
  if (sp.term) q.set("term", sp.term);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { address } = await params;
  if (!isAddress(address)) return {};
  const sp = await searchParams;
  const card = await getCard(address, sp.name, sp.term);
  const worst = worstSubject(card.subjects);
  const title = `${worst ? `${gradeLine(worst)} · ` : ""}${card.status}`;
  const description = `“${card.teacherComments[0]}” — Harrow. Show me your grades.`;
  const origin = await siteOrigin();
  const image = {
    url: `${origin}/card/${address}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `Report card for ${shortAddress(address)}: ${title}`,
  };
  return {
    title: `${title} — Report Card`,
    description,
    alternates: { canonical: `/card/${address}${cardQuery(sp)}` },
    openGraph: {
      type: "website",
      siteName: "Report Cards",
      title,
      description,
      url: `/card/${address}${cardQuery(sp)}`,
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CardPage({ params, searchParams }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  const sp = await searchParams;
  const card = await getCard(address, sp.name, sp.term);
  const origin = await siteOrigin();

  const cardUrl = `${origin}/card/${address}${cardQuery(sp)}`;
  const imageUrl = `/card/${address}/opengraph-image`;
  const worst = worstSubject(card.subjects);
  const stamp = statusLines(card.status);
  const tone = statusTone(card.status);
  const who = shortAddress(address);
  const prev = (term: number) =>
    `?term=${term}${sp.name ? `&name=${encodeURIComponent(sp.name)}` : ""}`;

  return (
    <main className="card-page">
      <TopBar
        right={
          <Link className="btn btn-small" href="/#enroll">
            GRADE A WALLET →
          </Link>
        }
      />
      <Ticker items={tickerItems(card)} seconds={34} />

      <div className="card-layout">
        <section className="card-stage">
          <Candles
            className="stage-candles"
            seed={hashString(address)}
            shape={tone === "good" ? "chop" : "pump-dump"}
          />
          <div className="spotlight" aria-hidden />
          <span className="stage-sticker ss-final" aria-hidden>
            GRADES
            <br />
            ARE FINAL
          </span>
          <ReportCardView card={card} />
        </section>

        <aside className={`verdict tone-${tone}`}>
          <div className="verdict-hype">
            <p className="v-kicker">
              <span className="v-live" /> OFFICIAL RESULT · {who} · {card.semester.label}
            </p>
            {stamp.kicker && <p className="v-status-kicker">{stamp.kicker}</p>}
            <h2 className="v-status" style={{ "--w": widestWord(stamp.main) } as CSSProperties}>
              {stamp.main}
            </h2>
            {worst && (
              <p className="v-worst">
                WORST GRADE <span className="v-grade">{worst.grade}</span>
                <span className="v-subject">IN {worst.name.toUpperCase()}</span>
              </p>
            )}
          </div>

          <ShareBar
            intentUrl={xIntentUrl(shareText(card), cardUrl)}
            cardUrl={cardUrl}
            imageUrl={imageUrl}
            fileName={`report-card-${address.slice(0, 8)}.png`}
          />

          <blockquote className="v-harrow">
            “{card.teacherComments[0]}”<cite>— HARROW, HOMEROOM</cite>
          </blockquote>

          <nav className="v-nav">
            {card.semester.term > 1 && (
              <Link href={prev(card.semester.term - 1)}>← TERM {card.semester.term - 1} TRANSCRIPT</Link>
            )}
            <Link href="/">WHAT IS THIS?</Link>
          </nav>

          <div className="v-again">
            <p className="v-again-title">GRADE ANOTHER WALLET</p>
            <WalletForm compact />
          </div>
        </aside>
      </div>
    </main>
  );
}
