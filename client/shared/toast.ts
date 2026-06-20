export const NOTEZY_TOAST_EVENT = "notezy:toast";

export type ToastTone = "success" | "info" | "error";

export function showToast(message: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(NOTEZY_TOAST_EVENT, { detail: { message, tone } }),
  );
}
