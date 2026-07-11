import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "mc_visitor_session";
const LAST_PING_KEY = "mc_visitor_last_ping";
const PING_INTERVAL_MS = 5 * 60 * 1000; // one visit row per session per 5 min per path

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (window.crypto?.randomUUID?.() as string | undefined) ??
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

export async function trackVisit(path: string) {
  if (typeof window === "undefined") return;
  try {
    const key = `${LAST_PING_KEY}:${path}`;
    const last = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < PING_INTERVAL_MS) return;
    sessionStorage.setItem(key, String(Date.now()));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("visitor_events" as any) as any).insert({
      session_id: getSessionId(),
      path: path.slice(0, 300),
      user_agent: (navigator.userAgent ?? "").slice(0, 300),
    });
  } catch {
    // silent — analytics must never break the app
  }
}

// ---------------- Live presence (shared singleton) ----------------
// Every open tab on the site joins a single "live-visitors" presence channel
// with a unique per-tab key. Admin panel subscribes as a read-only observer.

type Listener = (count: number) => void;
type PresenceChannel = ReturnType<typeof supabase.channel>;

let channel: PresenceChannel | null = null;
let presenceKey: string | null = null;
let refCount = 0;
const listeners = new Set<Listener>();
let lastCount = 1;

function computeCount(ch: PresenceChannel): number {
  try {
    const state = ch.presenceState() as Record<string, unknown>;
    return Math.max(1, Object.keys(state).length);
  } catch {
    return 1;
  }
}

function notify(n: number) {
  lastCount = n;
  listeners.forEach((l) => {
    try {
      l(n);
    } catch {
      /* noop */
    }
  });
}

function ensureChannel(): PresenceChannel | null {
  if (typeof window === "undefined") return null;
  if (channel) return channel;
  try {
    presenceKey =
      (window.crypto?.randomUUID?.() as string | undefined) ??
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    const ch = supabase.channel("live-visitors", {
      config: { presence: { key: presenceKey } },
    });
    const recount = () => notify(computeCount(ch));
    ch.on("presence", { event: "sync" }, recount)
      .on("presence", { event: "join" }, recount)
      .on("presence", { event: "leave" }, recount)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await ch.track({ at: new Date().toISOString(), path: window.location.pathname });
          } catch {
            /* noop */
          }
          recount();
        }
      });
    channel = ch;
    return ch;
  } catch {
    return null;
  }
}

function teardownChannel() {
  if (!channel) return;
  try {
    channel.untrack();
  } catch {
    /* noop */
  }
  try {
    supabase.removeChannel(channel);
  } catch {
    /* noop */
  }
  channel = null;
  presenceKey = null;
  lastCount = 1;
}

/**
 * Join the shared live-visitors presence channel while this tab is open.
 * Returns a cleanup function to call on unmount.
 */
export function joinLivePresence(): () => void {
  if (typeof window === "undefined") return () => {};
  refCount += 1;
  ensureChannel();

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      const ch = ensureChannel();
      if (ch) {
        try {
          void ch.track({ at: new Date().toISOString(), path: window.location.pathname });
        } catch {
          /* noop */
        }
      }
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const onUnload = () => {
    try {
      channel?.untrack();
    } catch {
      /* noop */
    }
  };
  window.addEventListener("pagehide", onUnload);
  window.addEventListener("beforeunload", onUnload);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", onUnload);
    window.removeEventListener("beforeunload", onUnload);
    refCount = Math.max(0, refCount - 1);
    if (refCount === 0) teardownChannel();
  };
}

/**
 * Subscribe to live-visitor count updates. Also joins the channel (so the
 * admin panel is counted as one live viewer, which is correct).
 */
export function subscribeLiveCount(listener: Listener): () => void {
  listeners.add(listener);
  const leave = joinLivePresence();
  // fire immediately with current best estimate
  try {
    listener(channel ? computeCount(channel) : lastCount);
  } catch {
    /* noop */
  }
  return () => {
    listeners.delete(listener);
    leave();
  };
}
