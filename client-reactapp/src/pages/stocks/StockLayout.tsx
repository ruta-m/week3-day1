// src/pages/stock/StockLayout.tsx
import { useParams, NavLink, Outlet } from 'react-router-dom';
 
export default function StockLayout() {
  const { symbol } = useParams<{ symbol: string }>();
 
  // Tab link style — highlight the active tab
  const tabStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'inline-block',
    padding: '8px 16px',
    marginRight: '4px',
    textDecoration: 'none',
    borderBottom: isActive ? '2px solid #00C87C' : '2px solid transparent',
    color: isActive ? '#00C87C' : '#888',
    fontWeight: isActive ? 'bold' : 'normal',
  });
 
  return (
    <div>
      {/* Stock header — stays visible across all tabs */}
      <h2>{symbol}</h2>
      <p style={{ color: '#888' }}>NSE · Equity</p>
 
      {/* Tab navigation */}
      <nav style={{ borderBottom: '1px solid #222', marginBottom: '20px' }}>
        <NavLink to='overview'   style={tabStyle}>Overview</NavLink>
        <NavLink to='financials' style={tabStyle}>Financials</NavLink>
        <NavLink to='news'       style={tabStyle}>News</NavLink>
      </nav>
 
      {/* Tab content renders here */}
      <Outlet />
    </div>
  );
}