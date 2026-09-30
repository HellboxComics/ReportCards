import { Ticker } from "@/components/Ticker";
import { TopBar } from "@/components/TopBar";
import { WalletForm } from "@/components/WalletForm";

export default function NotFound() {
  return (
    <main className="lost">
      <TopBar />
      <Ticker items={["HALL PASS DENIED", "THAT IS NOT A WALLET", "SEE ME AFTER CLASS"]} seconds={24} />
      <section className="lost-body">
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
