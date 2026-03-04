import { create } from "zustand";
import type { NormalizedStock, RawStockPayload } from "../domains/market/types";
import { normalizeStock } from "../domains/market/market.normalizer";
 
type MarketStore = {
  stocks:       Record<string, NormalizedStock>;
  priceHistory: Record<string, number[]>;
  setStock: (raw: RawStockPayload, serverTs: number) => void;

//   -----NEW CODE-----
  latencyMs:    number | null;  // null until first PONG received
  setLatency: (ms: number) => void; 
// -----NEW CODE-----
};
 
export const useMarketStore = create<MarketStore>((set) => ({
  stocks: {}, priceHistory: {},
  latencyMs: null,
  setLatency: (ms) => set({ latencyMs: ms }),

 
  setStock: (raw, serverTs) => {
    set((state) => {
      const prev       = state.stocks[raw.symbol];
      const normalized = normalizeStock(raw, prev, serverTs);
      //                 ↑ raw server data → clean NormalizedStock
 
      const oldH = state.priceHistory[raw.symbol] ?? [];
      const newH = [...oldH, normalized.price].slice(-30);
 
      return {
        stocks:       { ...state.stocks, [normalized.symbol]: normalized },
        priceHistory: { ...state.priceHistory, [normalized.symbol]: newH },
      };
    });
  },
}));