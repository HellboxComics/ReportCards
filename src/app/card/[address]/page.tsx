import type { Metadata } from "next";
import { cache, type CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShow, Replayable } from "@/components/Replay";
import { ReportCardView } from "@/components/ReportCardView";
import { ShareBar } from "@/components/ShareBar";
import { DESK, Stickers } from "@/components/Stickers";
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";
import { loadReportCard } from "@/lib/load";
import { headlineComment } from "@/lib/paperwork";
import { isAddress } from "@/lib/providers";
import { shortAddress } from "@/lib/reportCard";
import {
  INCIDENT_LABEL,
  cardImagePath,
  cardPath,
  customName,
  gradeLine,
  isBackhanded,
  shareText,
  statusLines,
  textWidth,
  tickerItems,
  widestWord,
  worstSubject,
  xIntentUrl,
} from "@/lib/share";
import { statusTheme } from "@/lib/theme";
import { siteOrigin } from "../../site";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ name?: string; term?: string }>;
};

/** One provider fetch per request, shared by generateMetadata and the page. */
const getCard = cache((address: string, name?: string, term?: string) =>
  loadReportCard(address, { name, term }),
);

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { address } = await params;
  if (!isAddress(address)) return { title: "Hall pass denied — Report Cards" };
  const sp = await searchParams;
  const card = await getCard(address, sp.name, sp.term);
  const worst = worstSubject(card.subjects);
  const name = customName(card);
  const origin = await siteOrigin();
  const title = `${worst ? `${gradeLine(worst)} · ` : ""}${card.status}`;
  const description = `“${headlineComment(card.teacherComments)}” — Harrow. Show me your grades.`;
  const url = origin + cardPath(address, card.semester.term, name);
  const image = {
    url: origin + cardImagePath(address, card.semester.term, name),
    width: 1200,
    height: 630,
    alt: `Report card for ${name ?? shortAddress(address)}: ${title}`,
  };
  return {
    title: `${title} — Report Card`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "Report Cards", title, description, url, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function CardPage({ params, searchParams }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  const sp = await searchParams;
  const card = await getCard(address, sp.name, sp.term);
  const origin = await siteOrigin();

  const name = customName(card);
  const term = card.semester.term;
  const cardUrl = origin + cardPath(address, term, name);
  const imageUrl = cardImagePath(address, term, name);
  const theme = statusTheme(card.status);
  const worst = worstSubject(card.subjects);
  const stamp = statusLines(card.status);
  const who = name?.toUpperCase() ?? shortAddress(address);
  const quote = headlineComment(card.teacherComments);

  return (
    <main
      className={`card-page st-${theme.key}`}
      style={
        {
          "--st-bg": theme.bg,
          "--st-bg2": theme.bg2,
          "--st-hot": theme.hot,
          "--hole": theme.bg2,
        } as CSSProperties
      }
    >
      <TopBar
        right={
          <Link className="btn btn-small" href="/#enroll">
            GRADE A WALLET →
          </Link>
        }
      />
      <Ticker variant="verdict" items={tickerItems(card)} seconds={32} />

      <div className="card-layout">
        <section className="card-stage">
          <Stickers items={DESK} />
          <span className="tag tag-burst ss-final" aria-hidden>
            GRADES
            <br />
            ARE FINAL
          </span>
          <Replayable>
            <ReportCardView card={card} />
          </Replayable>
        </section>

        <aside className="verdict">
          <div className="verdict-hype">
            <p className="v-kicker">
              <span className="v-live" /> OFFICIAL RESULT · {who} · {card.semester.label}
            </p>
            {stamp.kicker && <p className="v-status-kicker">{stamp.kicker}</p>}
            <h2
              className="v-status"
              style={{ "--w": widestWord(stamp.main), "--tw": textWidth(stamp.main) } as CSSProperties}
            >
              {stamp.main}
            </h2>
            {worst && (
              <p className="v-worst">
                <span className="v-worst-label">
                  {isBackhanded(worst) ? "NOT A COMPLIMENT" : "WORST GRADE"}
                </span>
                <span className="v-grade">{worst.grade}</span>
                <span className="v-subject">IN {worst.name.toUpperCase()}</span>
              </p>
            )}
            {card.incidents.length > 0 && (
              <ul className="v-incidents" aria-label="Incidents">
                {card.incidents.map((i) => (
                  <li key={i}>+ {INCIDENT_LABEL[i]}</li>
                ))}
              </ul>
            )}
          </div>

          <ShareBar
            intentUrl={xIntentUrl(shareText(card), cardUrl)}
            cardUrl={cardUrl}
            imageUrl={imageUrl}
            fileName={`report-card-${theme.key}-${address.slice(0, 8).toLowerCase()}.png`}
          />

          <blockquote className="v-harrow">
            “{quote}”<cite>— HARROW, HOMEROOM</cite>
          </blockquote>

          <nav className="v-nav">
            {term > 1 && (
              <Link href={cardPath(address, term - 1, name)}>← TERM {term - 1} TRANSCRIPT</Link>
            )}
            <Link href="/">WHAT IS THIS?</Link>
          </nav>

          <div className="v-again">
            <p className="v-again-title">GRADE ANOTHER WALLET</p>
            <WalletForm compact />
          </div>
        </aside>
      </div>

      <ReplayShow
        grade={worst?.grade}
        subject={worst?.name}
        backhanded={worst ? isBackhanded(worst) : false}
        kicker={stamp.kicker}
        status={stamp.main}
        quote={quote}
      />
    </main>
  );
}
