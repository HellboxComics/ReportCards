import Link from "next/link";
import { notFound } from "next/navigation";
import { ReportCardView } from "@/components/ReportCardView";
import { loadReportCard } from "@/lib/load";
import { isAddress } from "@/lib/providers";

type Props = {
  params: Promise<{ address: string }>;
  searchParams: Promise<{ name?: string; term?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props) {
  const { address } = await params;
  if (!isAddress(address)) return {};
  const card = await loadReportCard(address, await searchParams);
  return {
    title: `${card.status} — ${card.semester.label} Report Card`,
    description: card.teacherComments[0],
  };
}

export default async function CardPage({ params, searchParams }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  const sp = await searchParams;
  const card = await loadReportCard(address, sp);
  const q = (term: number) =>
    `?term=${term}${sp.name ? `&name=${encodeURIComponent(sp.name)}` : ""}`;

  return (
    <main className="desk">
      <ReportCardView card={card} />
      <nav className="transcript">
        {card.semester.term > 1 && <Link href={q(card.semester.term - 1)}>← previous semester</Link>}
        <Link href="/">grade another wallet</Link>
      </nav>
    </main>
  );
}
