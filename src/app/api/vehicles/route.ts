import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/security";

// Proxies the free NHTSA vPIC API so the browser gets clean, cached lists.
const VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const year = searchParams.get("year") ?? "";
  const make = searchParams.get("make") ?? "";

  if (!rateLimit(`vehicles:${clientIp(req.headers)}`, 60, 60 * 1000).ok) {
    return NextResponse.json({ items: [], error: "Too many requests" }, { status: 429 });
  }
  const thisYear = new Date().getFullYear();
  if (!/^\d{4}$/.test(year) || Number(year) < 1981 || Number(year) > thisYear + 1) {
    return NextResponse.json({ error: "year required" }, { status: 400 });
  }

  try {
    if (type === "models") {
      // Only plain make names go to NHTSA.
      if (!/^[A-Za-z0-9 .&'-]{1,40}$/.test(make)) return NextResponse.json({ error: "make required" }, { status: 400 });
      // Ask for passenger cars, pickups and SUVs separately so motorcycles, ATVs and trailers that
      // share a make name stay out of the list; fall back to the plain list if the typed calls fail.
      const typed = await Promise.all(
        ["car", "truck", "multipurpose"].map((t) =>
          fetch(`${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}/vehicletype/${t}?format=json`, {
            next: { revalidate: 86400 },
          })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => (Array.isArray(j?.Results) ? (j.Results as { Model_Name?: unknown }[]) : null))
            .catch(() => null),
        ),
      );
      let rows = typed.flatMap((r) => r ?? []);
      if (typed.every((r) => r === null)) {
        const res = await fetch(`${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`, {
          next: { revalidate: 86400 },
        });
        if (!res.ok) throw new Error(`vPIC ${res.status}`);
        const data: unknown = (await res.json())?.Results;
        rows = Array.isArray(data) ? data : [];
      }
      const names = Array.from(
        new Set(rows.map((r) => String(r?.Model_Name ?? "").trim().slice(0, 80)).filter(Boolean)),
      ).slice(0, 500);
      return NextResponse.json({ items: names.sort() });
    }
    return NextResponse.json({ error: "type must be models" }, { status: 400 });
  } catch {
    return NextResponse.json({ items: [], error: "Vehicle lookup unavailable" }, { status: 502 });
  }
}
