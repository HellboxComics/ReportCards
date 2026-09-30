"use server";

import { redirect } from "next/navigation";
import { isAddress } from "@/lib/providers";

export async function lookup(form: FormData) {
  const address = String(form.get("address") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  if (!isAddress(address)) redirect("/?error=1#enroll");
  redirect(`/card/${address}${name ? `?name=${encodeURIComponent(name)}` : ""}`);
}
