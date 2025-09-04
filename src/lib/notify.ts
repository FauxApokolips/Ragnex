let hasFocus = true;
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    hasFocus = !document.hidden;
  });
}
export function pageHasFocus() {
  return hasFocus;
}

export async function ensureNotifyPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}

export function notifyNewMessage(opts: {
  title: string;
  body: string;
  icon?: string;
  onClick?: () => void;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const n = new Notification(opts.title, { body: opts.body, icon: opts.icon, badge: opts.icon });
  if (opts.onClick) n.onclick = opts.onClick;
  setTimeout(() => n.close(), 5000);
}
