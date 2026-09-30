import { lookup } from "@/app/actions";

/** The "mint box": paste a wallet, get graded. */
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
      <div className="mint-bar" aria-hidden>
        <span className="mint-dot" />
        <span>ENROLL_WALLET.EXE</span>
        <span className="mint-net">ROBINHOOD CHAIN</span>
      </div>
      <label className="mint-field">
        <span className="mint-label">STUDENT WALLET</span>
        <input
          name="address"
          placeholder="0x… paste wallet address"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          pattern="^0x[0-9a-fA-F]{40}$"
          title="A 0x wallet address (42 characters)"
          required
        />
      </label>
      {!compact && (
        <label className="mint-field mint-name">
          <span className="mint-label">
            NAME ON CARD <em>optional</em>
          </span>
          <input name="name" placeholder="Jamie Doe" autoComplete="off" maxLength={40} />
        </label>
      )}
      {error && <p className="mint-error">That is not a wallet. See me after class.</p>}
      <button type="submit" className="btn btn-mint">
        GET MY GRADES <span aria-hidden>→</span>
      </button>
      {!compact && (
        <ul className="mint-chips" aria-label="Fine print">
          <li>READ-ONLY</li>
          <li>NO WALLET CONNECT</li>
          <li>GRADES ARE FINAL</li>
          <li className="chip-red">NO RETAKES</li>
        </ul>
      )}
    </form>
  );
}
