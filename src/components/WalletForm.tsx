import { lookup } from "@/app/actions";

/** Paste a wallet, get graded. The name is optional and tucked away. */
export function WalletForm({
  error = false,
  compact = false,
  id,
}: {
  error?: boolean;
  compact?: boolean;
  id?: string;
}) {
  return (
    <form action={lookup} className={`mint${compact ? " mint-compact" : ""}`} id={id}>
      <label className="mint-field">
        <span className="mint-label">
          STUDENT WALLET <em>· Robinhood Chain</em>
        </span>
        <input
          name="address"
          placeholder="0x… paste a wallet address"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          pattern="^0x[0-9a-fA-F]{40}$"
          title="A 0x wallet address (42 characters)"
          required
        />
      </label>
      {error && <p className="mint-error">That is not a wallet. See me after class.</p>}
      <button type="submit" className="btn btn-hot btn-mint">
        GET MY GRADES <span aria-hidden>→</span>
      </button>
      {!compact && (
        <>
          <details className="mint-name">
            <summary>+ write a student name on it (optional)</summary>
            <input name="name" placeholder="Jamie Doe" autoComplete="off" maxLength={40} aria-label="Name on card" />
          </details>
          <ul className="mint-chips" aria-label="Fine print">
            <li>READ-ONLY</li>
            <li>NO WALLET CONNECT</li>
            <li>GRADES ARE FINAL</li>
            <li className="chip-red">NO RETAKES</li>
          </ul>
        </>
      )}
    </form>
  );
}
