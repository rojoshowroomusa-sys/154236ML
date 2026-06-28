import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import App from './App.tsx';
import EditProductPage from './pages/EditProductPage';
import EditCouponPage from './pages/EditCouponPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/create" element={<EditProductPage />} />
        <Route path="/admin/edit/:id" element={<EditProductPage />} />
        <Route path="/admin/coupons/create" element={<EditCouponPage />} />
        <Route path="/admin/coupons/edit/:id" element={<EditCouponPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
