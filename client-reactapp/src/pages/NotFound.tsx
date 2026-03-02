// 404 catch-all

import { Link } from 'react-router-dom';
 
const saved = ['TCS', 'INFY'];  // replace with real state/store
 
export default function Watchlist() {
  return (
    <div>
      <h2>My Watchlist</h2>
      {saved.map(sym => (
        <div key={sym}>
          <Link to={`/stock/${sym}`}>{sym}</Link>
        </div>
      ))}
    </div>
  );
}
