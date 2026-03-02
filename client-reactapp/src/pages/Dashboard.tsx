// main stock table

import { useNavigate } from 'react-router-dom';
 
// Placeholder stocks — replace with your useMarketFeed hook
const STOCKS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'WIPRO'];
 
export default function Dashboard() {
  const navigate = useNavigate();
 
  return (
    <div>
      <h2>Live Market</h2>
      {STOCKS.map(sym => (
        <div
          key={sym}
          onClick={() => navigate(`/stock/${sym}`)}
          style={{ cursor: 'pointer', padding: '12px', marginBottom: '4px',
                   border: '1px solid #222', borderRadius: '6px' }}
        >
          {sym} →
        </div>
      ))}
    </div>
  );
}
