import type { Semester, WalletActivity } from "../types";
import { blockscoutActivity } from "./blockscout";
import { mockActivity } from "./mock";

export function isAddress(s: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(s);
}

export async function getActivity(
  address: string,
  semester: Semester,
  now: number,
): Promise<WalletActivity> {
  const provider = process.env.DATA_PROVIDER ?? "mock";
  if (provider === "blockscout") return blockscoutActivity(address, semester);
  if (provider === "mock") return mockActivity(address, semester, now);
  throw new Error(`unknown DATA_PROVIDER: ${provider}`);
}
