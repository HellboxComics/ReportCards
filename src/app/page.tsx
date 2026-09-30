import { redirect } from "next/navigation";
import { isAddress } from "@/lib/providers";

async function lookup(form: FormData) {
  "use server";
  const address = String(form.get("address") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  if (!isAddress(address)) redirect("/?error=1");
  redirect(`/card/${address}${name ? `?name=${encodeURIComponent(name)}` : ""}`);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="home">
      <div className="paper home-form">
        <p className="dept">ROBINHOOD CHAIN UNIFIED SCHOOL DISTRICT</p>
        <h1>GET YOUR WALLET&apos;S REPORT CARD</h1>
        <p className="fine">
          Grades are final. Complaints may be submitted to the principal, who does not care.
        </p>
        <form action={lookup}>
          <label>
            STUDENT WALLET
            <input name="address" placeholder="0x…" autoComplete="off" spellCheck={false} required />
          </label>
          <label>
            STUDENT NAME <span className="fine">(optional)</span>
            <input name="name" placeholder="Last, First" autoComplete="off" />
          </label>
          {error && <p className="error">That is not a wallet. See me after class.</p>}
          <button type="submit">PRINT REPORT CARD</button>
        </form>
      </div>
    </main>
  );
}
