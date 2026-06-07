import { supabase } from './lib/supabase';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Wallet from './pages/Wallet';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Publish from './pages/Publish';
import CreatorPanel from './pages/CreatorPanel';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard';
import { mockProducts, initialTransactions } from './data/mockData';
import { Product, Transaction, UserProfile, AppSettings } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    username: "...", email: "", bio: "", avatar: "", verified: false, memberSince: "", role: "User"
  });

  // --- BUSCAR DADOS REAIS DO SUPABASE ---
  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserData(session.user);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    initApp();
  }, []);

  const fetchUserData = async (user: any) => {
    // 1. Busca Perfil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    // 2. Busca Saldo (Crie a tabela 'wallet' no Supabase se não tiver)
    const { data: walletData } = await supabase.from('wallet').select('available_balance').eq('user_id', user.id).single();
    
    if (profileData) setProfile({
      username: profileData.username,
      email: user.email,
      bio: profileData.bio,
      avatar: profileData.avatar_url,
      verified: true,
      memberSince: "2026",
      role: profileData.role || "Usuário"
    });
    if (walletData) setBalance(Number(walletData.available_balance));
  };

  const handleStripeCheckout = async (productId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242';
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user.id, productId })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (e) { alert("Ligue o servidor local!"); }
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={() => setIsLoggedIn(true)} />} />
        
        <Route element={isLoggedIn ? <Layout balance={balance} profile={profile} searchQuery="" onSearchChange={() => {}} onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/login" />}>
          
          <Route path="/" element={<Marketplace products={products} searchQuery="" onSearchChange={() => {}} favoriteIds={[]} onToggleFavorite={() => {}} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} libraryIds={[]} favoriteIds={[]} onToggleFavorite={() => {}} />} />
          
          {/* Checkout usando o SEU componente com o design original */}
          <Route path="/checkout/:id" element={
            <Checkout 
              products={products} 
              balance={balance} 
              onConfirmStripe={handleStripeCheckout}
              onDeductBalance={(amt) => { setBalance(b => b - amt); return true; }}
              onAddTransaction={(tx) => setTransactions([tx, ...transactions])}
              onAddToLibrary={() => {}}
            />
          } />

          <Route path="/wallet" element={<Wallet balance={balance} transactions={transactions} onAddFunds={(a) => setBalance(b => b + a)} onWithdrawFunds={(a) => {setBalance(b => b - a); return true;}} onAddTransaction={(t) => setTransactions([t, ...transactions])} />} />
          <Route path="/library" element={<Library products={products} libraryIds={[]}/>} />
          <Route path="/profile" element={<Profile profile={profile} balance={balance} libraryIds={[]} products={products} onLogout={() => supabase.auth.signOut()} />} />
          <Route path="/publish" element={<Publish products={products} onAddProduct={(p) => setProducts([p, ...products])} onUpdateProductStatus={() => {}} username={profile.username} />} />
          <Route path="/creator" element={<CreatorPanel products={products} onUpdateProductStatus={() => {}} onUpdateProductLogs={() => {}} username={profile.username} />} />
          <Route path="/support" element={<Support products={products} username={profile.username} userRole={profile.role} />} />
          <Route path="/admin" element={profile.role === 'Admin' ? <AdminDashboard products={products} onSetProducts={setProducts} currentUsername={profile.username} /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Settings profile={profile} settings={{} as any} onUpdateProfile={() => {}} onUpdateSettings={() => {}} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}