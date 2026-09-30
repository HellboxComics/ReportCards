"use server";

import { redirect } from "next/navigation";
import { isAddress } from "@/lib/providers";
import { semesterAt } from "@/lib/semester";
import { cardPath } from "@/lib/share";

export async function lookup(form: FormData) {
  const address = String(form.get("address") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  if (!isAddress(address)) redirect("/?error=1#enroll");
  // Pin the term in the address bar too, so a copied URL keeps this card.
  redirect(cardPath(address, semesterAt(Date.now()).term, name || undefined));
}
