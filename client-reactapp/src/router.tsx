// src/router.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout       from './components/Layout';
import Dashboard    from './pages/Dashboard';
// import StockDetail from './pages/StockDetail';
import Overview from './pages/stocks/Overview';
import Financials from './pages/stocks/Financials';    // NEW
import News from './pages/stocks/News';         // NEW
import Watchlist    from './pages/Watchlist';
import NotFound     from './pages/NotFound';
import StockLayout from './pages/stocks/StockLayout'; 

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
 
        {/* Nested routes for stock detail */}
        <Route path='stock/:symbol' element={<StockLayout />}>
          <Route index element={<Navigate to='overview' replace />} />
          <Route path='overview'    element={<Overview />} />
          <Route path='financials'  element={<Financials />} />
          <Route path='news'        element={<News />} />
        </Route>
 
        <Route path='watchlist' element={<Watchlist />} />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}