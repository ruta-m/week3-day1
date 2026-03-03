import { useEffect, useRef } from 'react';
import { useStore } from "../store/store";
import type { Stock } from "../types/types";

const SERVER_URL = "ws://localhost:8080";

// -----------NEW CODE-------------------
const PING_EVERY_MS = 25_000;  // send PING every 25 seconds
const PONG_WAIT_MS = 5_000;  // if no PONG in 5s, connection is dead
// -----------NEW CODE-------------------

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // -----------NEW CODE-------------------
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // -----------NEW CODE-------------------

  const { setStock, setConnected } = useStore();

  // Exponential backoff
  function getWaitTime(): number {
    const seconds = Math.pow(2, retryCountRef.current);
    return Math.min(seconds, 30) * 1000;
  }

  //  -----------NEW CODE--------------

  // ── Stop the heartbeat timers cleanly ──────────────────
  function stopHeartbeat() {
    if (pingTimerRef.current) { clearInterval(pingTimerRef.current); pingTimerRef.current = null; }
    if (pongTimerRef.current) { clearTimeout(pongTimerRef.current); pongTimerRef.current = null; }
  }

  // ── Start the heartbeat after a successful connection ───
  function startHeartbeat(ws: WebSocket) {
    stopHeartbeat(); // clear any old timers first

    pingTimerRef.current = setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;

      // Send the PING
      ws.send(JSON.stringify({ type: "PING", ts: Date.now() }));

      // Set a 5-second deadline for the PONG to arrive
      pongTimerRef.current = setTimeout(() => {
        console.warn("PONG timeout — closing zombie connection");
        ws.close(); // triggers onclose → reconnect
      }, PONG_WAIT_MS);

    }, PING_EVERY_MS);
  }
  //  -----------NEW CODE--------------


  function connect() {
    console.log(`Connecting to ${SERVER_URL}`);
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryCountRef.current = 0;

      //  -----------NEW CODE--------------
      startHeartbeat(ws); // ← start PING/PONG after connect
      //  -----------NEW CODE--------------
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        // -----------NEW CODE--------------
        if (msg.type === "PONG") {
          if (pongTimerRef.current) {
            clearTimeout(pongTimerRef.current);
            pongTimerRef.current = null;
          }
          return;
        }
        //-----------NEW CODE--------------

        const rawData = msg.data || msg.stock;

        if (
          rawData &&
          (msg.type === "SNAPSHOT" || msg.type === "QUOTE")
        ) {
          const formattedStock: Stock = {
            ...rawData,
            price: rawData.ltp,
          };

          setStock(formattedStock);

        } else if (msg.type === "INDEX" && msg.data) {
          console.log("Index Updated : ", msg.symbol, msg.data.value);
        }

      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);

      // -----------NEW CODE--------------
      stopHeartbeat(); // ← stop PING/PONG when disconnected
      // -----------NEW CODE--------------

      console.log("onclose started");
      const waitTime = getWaitTime();
      retryCountRef.current += 1;
      console.log(`Retrying in ${waitTime / 1000}s...`);
      retryTimeRef.current = setTimeout(connect, waitTime);
    };

    ws.onerror = () => {
      console.log("Websocket error - server may be offline");
    };
  }

  useEffect(() => {
    connect();
    return () => {
      // -----------NEW CODE--------------
      stopHeartbeat(); // ← cleanup on unmount
      // -----------NEW CODE--------------

      if (retryTimeRef.current) clearTimeout(retryTimeRef.current);

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);
}