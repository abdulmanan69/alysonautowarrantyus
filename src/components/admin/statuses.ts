// Lead statuses, in the order they usually happen.
export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  sold: "Sold",
  lost: "Lost",
  unqualified: "Unqualified",
};

export const STATUS_HELP: Record<string, string> = {
  new: "Just arrived; nobody has called yet.",
  contacted: "Reached by phone, text or email.",
  quoted: "Plan options and prices were sent.",
  sold: "Bought a plan.",
  lost: "Decided not to buy, or went quiet.",
  unqualified: "Car or situation doesn't qualify for a plan.",
};

export const STATUS_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  contacted: "bg-blue-50 text-blue-700",
  quoted: "bg-amber-50 text-amber-800",
  sold: "bg-emerald-50 text-emerald-700",
  lost: "bg-gray-100 text-gray-600",
  unqualified: "bg-red-50 text-red-700",
};

// Colours for the status bar on the dashboard.
export const STATUS_COLORS: Record<string, string> = {
  new: "#94A3B8",
  contacted: "#1F5FAD",
  quoted: "#F59E0B",
  sold: "#10B981",
  lost: "#CBD5E1",
  unqualified: "#EF4444",
};

/** Statuses that count as "still being worked". */
export const OPEN_STATUSES = ["new", "contacted", "quoted"];

export const MESSAGE_STATUS_LABELS: Record<string, string> = { new: "New", read: "Read", replied: "Replied", archived: "Archived" };
export const MESSAGE_STATUS_STYLES: Record<string, string> = {
  new: "bg-amber-50 text-amber-800",
  read: "bg-slate-100 text-slate-700",
  replied: "bg-emerald-50 text-emerald-700",
  archived: "bg-gray-100 text-gray-600",
};
