import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:8080";
const MAX_HISTORY = 60; // keep last 60 price points per stock for sparkline

export function useMarketFeed() {
  const [connected, setConnected] = useState(false);
  const [stocks, setStocks] = useState({});
  const [indices, setIndices] = useState({});
  const [depth, setDepth] = useState({});
  const [history, setHistory] = useState({}); 
  const [log, setLog] = useState([]);
  const wsRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    setLog(l => [{ msg, type, ts: Date.now() }, ...l].slice(0, 80));
  }, []);

  useEffect(() => {
    let reconnectTimer;
    // Keep track of whether the component is still mounted
    let isMounted = true; 

    const connect = () => {
      // Clean up any existing socket before creating a new one
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnected(true);
        addLog(`Connected to ${WS_URL}`, "success");
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnected(false);
        addLog("Disconnected — retrying in 2s", "warn");
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        if (!isMounted) return;
        addLog("Connection error", "error");
      };

      ws.onmessage = (e) => {
  if (!isMounted) return;
  try {
    const msg = JSON.parse(e.data);

    if (msg.type === "SNAPSHOT" && Array.isArray(msg.data)) {
      const initialStocks = {};
      const initialHistory = {};

      msg.data.forEach(item => {
        // Map ltp to price so the UI has a value to show immediately
        initialStocks[item.symbol] = { ...item, price: item.ltp };
        // Seed with two identical points so the chart is visible immediately
        initialHistory[item.symbol] = [item.ltp, item.ltp]; 
      });

      setStocks(initialStocks);
      setHistory(initialHistory);
    }

    if (msg.type === "QUOTE") {
      const sym = msg.symbol;
      const ltp = msg.data.ltp;

      setStocks(prev => ({ ...prev, [sym]: { ...msg.data, symbol: sym } }));

      setHistory(prev => {
        const currentHistory = prev[sym] || [];
        // Add new price and keep the last 60 points
        return { ...prev, [sym]: [...currentHistory, ltp].slice(-MAX_HISTORY) };
      });
    }
  } catch (err) {
    console.error("Chart Data Error:", err);
  }
};
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Important: Stop the reconnect loop
        wsRef.current.close();
      }
    };
  }, [addLog]); // Added addLog to dependencies

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { connected, stocks, indices, depth, history, log, send };
}