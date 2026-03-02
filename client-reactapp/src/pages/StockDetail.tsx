// individual stock page

// src/pages/StockDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
 
export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();  // reads :symbol from URL
  const navigate   = useNavigate();
 
  return (
    <div>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>{symbol}</h2>
      <p>Showing details for {symbol}.</p>
      <p>Connect your stock data here using the symbol prop.</p>
    </div>
  );
}
