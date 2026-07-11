import { useEffect, useState, useCallback } from "react";
import type { CartItem } from "./whatsapp";

const KEY = "mc-cart-v1";
const EVT = "mc-cart-changed";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const add = useCallback((item: CartItem) => {
    const cur = read();
    const key = `${item.id}|${item.size ?? ""}`;
    const idx = cur.findIndex((i) => `${i.id}|${i.size ?? ""}` === key);
    if (idx >= 0) cur[idx].qty += item.qty;
    else cur.push(item);
    write(cur);
  }, []);

  const remove = useCallback((id: string, size?: string) => {
    const key = `${id}|${size ?? ""}`;
    write(read().filter((i) => `${i.id}|${i.size ?? ""}` !== key));
  }, []);

  const setQty = useCallback((id: string, qty: number, size?: string) => {
    const key = `${id}|${size ?? ""}`;
    const cur = read().map((i) => (`${i.id}|${i.size ?? ""}` === key ? { ...i, qty: Math.max(1, qty) } : i));
    write(cur);
  }, []);

  const clear = useCallback(() => write([]), []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return { items, add, remove, setQty, clear, total, count };
}
