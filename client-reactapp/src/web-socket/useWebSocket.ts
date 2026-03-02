import { useEffect, useRef } from "react";
import { useStore } from "../store/store";
import type { Stock } from "../types/types";
 
const SERVER_URL = "ws://localhost:8080";
 
export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  const { setStock, setConnected } = useStore();
 
  // Exponential backoff
  function getWaitTime(): number {
    const seconds = Math.pow(2, retryCountRef.current);
    return Math.min(seconds, 30) * 1000;
  }
 
  function connect() {
    console.log(`Connecting to ${SERVER_URL}`);
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;
 
    ws.onopen = () => {
      setConnected(true);
      retryCountRef.current = 0;
    };
 
    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
 
        // 1. Identify if the message contains stock data (SNAPSHOT or UPDATE)
        const rawData = msg.data || msg.stock;
 
        if (
          rawData &&
        //   (msg.type === "SNAPSHOT" || msg.type === "STOCK_UPDATE" ||  msg.type === "QUOTE")
          ( msg.type === "SNAPSHOT" ||  msg.type === "QUOTE")
        ) {
          // 2. IMPORTANT: Map 'ltp' to 'price' so the store actually "sees" the change
          const formattedStock: Stock = {
            ...rawData,
            price: rawData.ltp, // The server uses 'ltp', your store uses 'price'
          };
 
          setStock(formattedStock);
        } else if(msg.type === "INDEX" && msg.data){
            console.log("Index Updated : ", msg.symbol, msg.data.value);    
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    };
 
    ws.onclose = () => {
      setConnected(false);
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
      if (retryTimeRef.current) clearTimeout(retryTimeRef.current);
 
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);
}