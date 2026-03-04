import type {
  ParsedMessage,
  RawStockPayload,
} from "../../domains/market/types";

// Is this a real finite number? (rejects NaN, Infinity, strings)
function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

// Try JSON.parse — return null on failure instead of throwing
function safeParseJSON(raw: string): unknown | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Validate that every field we rely on is present and the right type
function validateStockPayload(s: unknown): s is RawStockPayload {
  if (typeof s !== "object" || s === null) return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.symbol === "string" &&
    typeof o.name === "string" &&
    typeof o.sector === "string" &&
    isFiniteNumber(o.price) &&
    isFiniteNumber(o.open) &&
    isFiniteNumber(o.high) &&
    isFiniteNumber(o.low) &&
    isFiniteNumber(o.prevClose) &&
    isFiniteNumber(o.change) &&
    isFiniteNumber(o.changePercent) &&
    isFiniteNumber(o.volume)
  );
}

// THE main exported function — input: raw string, output: ParsedMessage
// Guarantees: NEVER throws, ALWAYS returns a ParsedMessage
export function parseMessage(raw: string): ParsedMessage {
  const data = safeParseJSON(raw);
  if (data === null || typeof data !== "object")
    return { kind: "unknown", raw };

  const msg = data as Record<string, unknown>;

  switch (msg.type) {
    case "STOCK_UPDATE":
      if (!validateStockPayload(msg.stock)) return { kind: "unknown", raw };
      return {
        kind: "stock_update",
        stock: msg.stock as RawStockPayload,
        serverTs: typeof msg.ts === "number" ? msg.ts : Date.now(),
      };
    case "HELLO":
      return {
        kind: "hello",
        message: typeof msg.message === "string" ? msg.message : "",
      };
    case "PONG":
      return { kind: "pong", ts: typeof msg.ts === "number" ? msg.ts : 0 };
    default:
      return { kind: "unknown", raw };
  }
}
