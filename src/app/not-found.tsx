import { Stickers, type Sticker } from "@/components/Stickers";

/** Along the top of the page, above the headline. */
const LOST: Sticker[] = [
  { kind: "hazard", text: "RUG ZONE", x: 22, y: 8, w: 150, rot: -10 },
  { kind: "circle", text: "NGMI", bg: "#ffe600", fg: "#111", x: 58, y: 7, w: 90, rot: 12 },
  { kind: "bubble", text: "gm?", x: 86, y: 9, w: 96, rot: -8 },
];
import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";

export default function NotFound() {
  return (
    <main className="lost">
      <TopBar />
      <Ticker items={["HALL PASS DENIED", "THAT IS NOT A WALLET", "SEE ME AFTER CLASS"]} seconds={24} />
      <section className="lost-body">
        <Stickers items={LOST} className="lost-stickers" />
        <p className="block-kicker">ERROR 404 · OFFICE OF STUDENT DISCIPLINE</p>
        <h1 className="block-h">
          HALL PASS
          <br />
          <span className="red">DENIED.</span>
        </h1>
        <p className="block-sub">
          That is not a wallet, or this student transferred schools. Paste a real 0x address.
        </p>
        <WalletForm compact />
      </section>
    </main>
  );
}
