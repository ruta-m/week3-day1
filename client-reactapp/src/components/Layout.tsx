// shared header + nav (wraps all pages)

// src/components/Layout.tsx
import { NavLink, Outlet } from 'react-router-dom';
 
const navStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? '#00C87C' : '#888',
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  marginRight: '20px',
});
 
export default function Layout() {
  return (
    <div>
      {/* Header — renders on every page */}
      <header style={{ padding: '12px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <span style={{ color: '#00C87C', fontWeight: 'bold', marginRight: '24px' }}>groww</span>
        <NavLink to='/'          style={navStyle}>Dashboard</NavLink>
        <NavLink to='/watchlist' style={navStyle}>Watchlist</NavLink>
        <NavLink to='/login'     style={navStyle}>Login</NavLink>
      </header>
 
      {/* Page content — changes with every route */}
      <main style={{ padding: '20px' }}>
        <Outlet />   {/* ← current page renders here */}
      </main>
    </div>
  );
}
