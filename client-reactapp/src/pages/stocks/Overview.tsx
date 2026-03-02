// src/pages/stock/Overview.tsx
import { useParams } from 'react-router-dom';
 
export default function Overview() {
  const { symbol } = useParams<{ symbol: string }>();
 
  return (
    <div>
      <h3>Overview — {symbol}</h3>
      <p>LTP: ₹3,875.20</p>
      <p>Change: +1.2%</p>
      <p>Volume: 12.4L</p>
      {/* Connect your live data here */}
    </div>
  );
}
