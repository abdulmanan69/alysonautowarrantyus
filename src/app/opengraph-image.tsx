import { OG_SIZE, renderOg } from "@/lib/og";
import { site } from "@/lib/site";

// Homepage share card, built from the shared template in src/lib/og.tsx.
export const alt = `${site.name}: extended auto warranty plans`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOg({
    eyebrow: "Extended auto warranty plans",
    title: "Caring for your vehicle, every step of the way.",
    subtitle: "24/7 claims · Any ASE-certified shop · 30-day money-back guarantee",
    image: "/images/cta-car.webp",
  });
}
