export function formatEditorDate(date?: string) {
  if (!date) return "";

  const normalized = date.match(/^[A-Za-z]+\s+\d{1,2}$/)
    ? `${date}, 2025`
    : date;

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeNoteDate(date?: string) {
  if (!date) return "";

  const now = new Date();
  const normalized = date.match(/^[A-Za-z]+\s+\d{1,2}$/)
    ? `${date}, ${now.getFullYear()}`
    : date;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return date;

  const diffMs = now.getTime() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
  const dayDiff = Math.floor(
    (today.getTime() - target.getTime()) / 86400000,
  );

  if (dayDiff === 1) return "Yesterday";
  if (dayDiff <= 3) return `${dayDiff} days ago`;
  if (dayDiff <= 7) return "This week";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: parsed.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
