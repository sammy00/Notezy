import { NoteTone } from "../types/note";

export type NoteToneOption = {
  tone: NoteTone;
  label: string;
  swatch: string;
};

export const NOTE_TONE_OPTIONS: NoteToneOption[] = [
  { tone: "paper", label: "Classic Paper", swatch: "#F8F6F2" },
  { tone: "mint", label: "Lavender", swatch: "#E8DDF5" },
  { tone: "pistachio", label: "Mint", swatch: "#DDE9D5" },
  { tone: "sky", label: "Sky Blue", swatch: "#DCEBF4" },
  { tone: "blush", label: "Blush Pink", swatch: "#F7DADB" },
  { tone: "butter", label: "Butter Yellow", swatch: "#F1E8D8" },
  { tone: "peach", label: "Peach", swatch: "#F4C7AA" },
  { tone: "sage", label: "Stone Gray", swatch: "#828382" },
];
