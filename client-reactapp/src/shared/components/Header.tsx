import { useMarketStore } from "../../store/market.store";

export function Header({ isConnected }: { isConnected: boolean }) {
  const latencyMs = useMarketStore((s) => s.latencyMs);

  // green < 50ms · gold < 150ms · red >= 150ms
  const latColor =
    latencyMs === null
      ? "#484F58"
      : latencyMs < 50
        ? "#00C87C"
        : latencyMs < 150
          ? "#FFB800"
          : "#FF4D4D";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        backgroundColor: "#0D1117",
      }}
    >
      <span style={{ color: "#00C87C", fontWeight: "bold" }}>groww</span>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {latencyMs !== null && (
          <span
            style={{ fontFamily: "monospace", fontSize: 11, color: latColor }}
          >
            {latencyMs}ms
          </span>
        )}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: isConnected ? "#00C87C" : "#FF4D4D",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: isConnected ? "#00C87C" : "#FF4D4D",
          }}
        >
          {isConnected ? "LIVE" : "OFFLINE"}
        </span>
      </div>
    </div>
  );
}
