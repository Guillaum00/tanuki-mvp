export const MENU = {
  sandos: ["Banh Mi Tofu", "Celeriac Pastrami", "Katsu Pleurotes Curry"],
  slaws: ["Kimchi Slaw", "Red Slaw", "Peanut Slaw"],
  cookies: ["Matcha Chocolate", "Black Sesame", "Chocolate Chip"],
  teas: ["Genmaicha", "Hojicha", "Sencha"],
};

export const ZONES = [
  "Louise / Ixelles",
  "Quartier Européen",
  "Centre / Pentagone / Sablon",
  "Tour & Taxis",
];

export const ZONE_DAYS: Record<string, string> = {
  "Louise / Ixelles": "Mardi",
  "Quartier Européen": "Mercredi",
  "Centre / Pentagone / Sablon": "Jeudi",
  "Tour & Taxis": "Vendredi",
};

export const PRICE_PER_BOX = 15.5;
export const MIN_BOXES = 10;

export function formatPrice(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " €";
}

export function computeCutoff(deliveryDate: string): string {
  const d = new Date(deliveryDate);
  d.setDate(d.getDate() - 1);
  d.setHours(16, 0, 0, 0);
  return d.toISOString();
}

export function isCutoffPassed(cutoffAt: string): boolean {
  return new Date() > new Date(cutoffAt);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getNextDeliveryDates(): { label: string; value: string }[] {
  const dayMap: Record<number, string> = { 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi" };
  const results: { label: string; value: string }[] = [];
  const now = new Date();
  const limit = new Date(now);
  limit.setDate(limit.getDate() + 21);

  const cur = new Date(now);
  cur.setDate(cur.getDate() + 1);

  while (cur <= limit && results.length < 8) {
    const dow = cur.getDay();
    if (dow >= 2 && dow <= 5) {
      const cutoff = new Date(cur);
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(16, 0, 0, 0);
      if (cutoff > now) {
        const label = `${dayMap[dow]} ${cur.toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}`;
        const value = cur.toISOString().split("T")[0];
        results.push({ label, value });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return results;
}
