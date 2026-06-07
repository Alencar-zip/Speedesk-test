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
import { mockProducts } from './data/mockData';
import { Product, Transaction, UserProfile, UserRole, AppSettings } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [libraryIds, setLibraryIds] = useState<number[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    username: "Carregando...",
    email: "",
    bio: "Membro Speedesk",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgC4uQXopo7y3MwccZzzte0cJVY3c4i1Bq6BObMcuA_mP2K0EEb2utB_6F5w1qNJ7U6fp6qwd4EwLKE_kRLIwgh0gey7SEZe93Tg8DgwZxW4fMtnh1LClgZZ2cjciWIaKwXlU4M-4Yr8v3dZngtNqijVrz_lHZE8vJyVGVqtAHvB45NG270FvzQMWTjYTumWNygdX9h-da1wVaulBzv1kbfR1o_Nok0YzizEgcp1I66JwWyoQrG0p8GxaKC5X1QGe98a-96FHjuA",
    verified: false,
    memberSince: "2026",
    role: "Usuário" as UserRole
  });

  const [settings, setSettings] = useState<AppSettings>({
    language: "pt-BR", theme: "dark", marketAlerts: true, transactionsAlerts: true, marketingAlerts: false, simulateMalware: false
  });

  // --- BUSCA DE DADOS REAIS ---
  const fetchUserData = async (user: any) => {
    // 1. Perfil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    // 2. Saldo
    const { data: walletData } = await supabase.from('wallet').select('*').eq('user_id', user.id).single();
    // 3. Transações
    const { data: transData } = await supabase.from('transactions').select('*').eq('buyer_id', user.id);

    setProfile({
      username: profileData?.username || user.email.split('@')[0],
      email: user.email || "",
      bio: profileData?.bio || "Entusiasta de ativos digitais.",
      avatar: profileData?.avatar_url || profile.avatar,
      verified: profileData?.role === 'Admin',
      memberSince: profileData?.created_at ? new Date(profileData.created_at).getFullYear().toString() : "2026",
      role: (profileData?.role as UserRole) || "Usuário"
    });

    if (walletData) setBalance(Number(walletData.available_balance));
    if (transData) setTransactions(transData as unknown as Transaction[]);
  };

  const fetchMarketplace = async () => {
    const { data } = await supabase.from('products').select('*').eq('status', 'active');
    if (data && data.length > 0) setProducts(data as Product[]);
    else setProducts(mockProducts); // Fallback caso banco esteja vazio
  };

  useEffect(() => {
    fetchMarketplace();

    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserData(session.user);
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setBalance(0);
      }
    });

    initApp();
    return () => subscription.unsubscribe();
  }, []);

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
    } catch (e) { alert("Ligue o servidor local (npx tsx server.ts)!"); }
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLogin={() => setIsLoggedIn(true)} />} />
        
        <Route element={isLoggedIn ? (
          <Layout 
            balance={balance} 
            profile={profile} 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onLogout={() => supabase.auth.signOut()} 
          />
        ) : <Navigate to="/login" />}>
          
          <Route path="/" element={<Marketplace products={products} searchQuery={searchQuery} onSearchChange={setSearchQuery} favoriteIds={favoriteIds} onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} libraryIds={libraryIds} favoriteIds={favoriteIds} onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} />} />
          <Route path="/checkout/:id" element={<Checkout products={products} balance={balance} onConfirmStripe={handleStripeCheckout} onDeductBalance={(amt) => { setBalance(prev => prev - amt); return true; }} onAddTransaction={(tx) => setTransactions([tx, ...transactions])} onAddToLibrary={(id) => setLibraryIds([...libraryIds, id])} />} />
          <Route path="/wallet" element={<Wallet balance={balance} transactions={transactions} onAddFunds={(a) => setBalance(b => b + a)} onWithdrawFunds={(a) => {setBalance(b => b - a); return true;}} onAddTransaction={(t) => setTransactions([t, ...transactions])} />} />
          <Route path="/library" element={<Library products={products} libraryIds={libraryIds}/>} />
          <Route path="/profile" element={<Profile profile={profile} balance={balance} libraryIds={libraryIds} products={products} onLogout={() => supabase.auth.signOut()} />} />
          <Route path="/publish" element={<Publish products={products} onAddProduct={(p: any) => setProducts([p, ...products])} onUpdateProductStatus={() => {}} username={profile.username} />} />
          <Route path="/creator" element={<CreatorPanel products={products} onUpdateProductStatus={() => {}} onUpdateProductLogs={() => {}} username={profile.username} />} />
          <Route path="/support" element={<Support products={products} username={profile.username} userRole={profile.role} />} />
          <Route path="/admin" element={profile.role === 'Admin' ? <AdminDashboard products={products} onSetProducts={setProducts} currentUsername={profile.username} /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Settings profile={profile} settings={settings} onUpdateProfile={(u) => setProfile({...profile, ...u})} onUpdateSettings={(s) => setSettings({...settings, ...s})} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}