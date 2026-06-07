import { supabase } from './lib/supabase'; // Ajustado de ../ para ./
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
  const [searchQuery, setSearchQuery] = useState('');

  // --- ESTADOS GLOBAIS ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('speedesk_products');
    return saved ? JSON.parse(saved) : mockProducts;
  });

  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('speedesk_balance');
    return saved ? parseFloat(saved) : 14850.00;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('speedesk_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [libraryIds, setLibraryIds] = useState<number[]>([6]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [profile, setProfile] = useState<UserProfile>({
    username: "Carregando...",
    email: "",
    bio: "Entusiasta de ativos digitais.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgC4uQXopo7y3MwccZzzte0cJVY3c4i1Bq6BObMcuA_mP2K0EEb2utB_6F5w1qNJ7U6fp6qwd4EwLKE_kRLIwgh0gey7SEZe93Tg8DgwZxW4fMtnh1LClgZZ2cjciWIaKwXlU4M-4Yr8v3dZngtNqijVrz_lHZE8vJyVGVqtAHvB45NG270FvzQMWTjYTumWNygdX9h-da1wVaulBzv1kbfR1o_Nok0YzizEgcp1I66JwWyoQrG0p8GxaKC5X1QGe98a-96FHjuA",
    verified: true,
    memberSince: "Mar, 2026",
    role: "Comprador" // Alterado de "User" para "Comprador" para bater com seus tipos
  });

  const [settings, setSettings] = useState<AppSettings>({
    language: "pt-BR", theme: "dark", marketAlerts: true, transactionsAlerts: true, marketingAlerts: false, simulateMalware: false
  });

  // --- LÓGICA DE AUTENTICAÇÃO REAL ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => { // Adicionado :any
      handleAuth(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => { // Adicionado :any
      handleAuth(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (session: any) => {
    if (session) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setIsLoggedIn(true);
      setProfile({
        username: profileData?.username || session.user.email.split('@')[0],
        email: session.user.email,
        bio: profileData?.bio || 'Entusiasta de ativos digitais.',
        avatar: profileData?.avatar_url || 'https://sua-imagem-padrao.png',
        verified: true,
        memberSince: 'Jun, 2026',
        role: profileData?.role || 'Comprador'
      });
    } else {
      setIsLoggedIn(false);
    }
  };

  // --- LÓGICA FINANCEIRA ---
  const handleStripeCheckout = async (productId: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Por favor, faça login.");

      const response = await fetch('http://localhost:4242/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_1TeDXZQ3BpaRaOV8DsM4XODS',
          userId: session.user.id,
          productId: productId
        })
      });

      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Erro: Motor financeiro offline (porta 4242).");
    }
  };

  // Funções de Carteira corrigidas para retornar boolean conforme esperado pelos componentes
  const handleDeductBalance = (amt: number): boolean => {
    if (balance >= amt) {
      setBalance(prev => prev - amt);
      return true;
    }
    return false;
  };

  const handleWithdrawFunds = (amt: number): boolean => {
    if (balance >= amt) {
      setBalance(prev => prev - amt);
      return true;
    }
    return false;
  };

  const handleAddTransaction = (tx: any) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const handleAddToLibrary = (id: number) => {
    setLibraryIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    localStorage.setItem('speedesk_products', JSON.stringify(products));
    localStorage.setItem('speedesk_balance', balance.toString());
    localStorage.setItem('speedesk_transactions', JSON.stringify(transactions));
    localStorage.setItem('speedesk_library', JSON.stringify(libraryIds));
    localStorage.setItem('speedesk_favorites', JSON.stringify(favoriteIds));
  }, [products, balance, transactions, libraryIds, favoriteIds]);

  if (loading) return <div className="bg-[#101415] min-h-screen flex items-center justify-center text-primary font-mono">CARREGANDO...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLogin={() => setIsLoggedIn(true)} />} />

        <Route element={isLoggedIn ? (
          <Layout
            balance={balance} profile={profile} searchQuery={searchQuery}
            onSearchChange={setSearchQuery} onLogout={() => supabase.auth.signOut()}
          />
        ) : <Navigate to="/login" replace />}>

          <Route path="/" element={<Marketplace products={products} searchQuery={searchQuery} onSearchChange={setSearchQuery} favoriteIds={favoriteIds} onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id])} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} libraryIds={libraryIds} favoriteIds={favoriteIds} onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id])} />} />

          <Route
            path="/checkout/:id"
            element={
              <Checkout
                products={products}
                balance={balance}
                onConfirmStripe={handleStripeCheckout}
                onDeductBalance={handleDeductBalance}
                onAddTransaction={handleAddTransaction}
                onAddToLibrary={handleAddToLibrary}
              />
            }
          />

          <Route path="/wallet" element={<Wallet balance={balance} transactions={transactions} onAddFunds={(amt: number) => setBalance(b => b + amt)} onWithdrawFunds={handleWithdrawFunds} onAddTransaction={handleAddTransaction} />} />

          <Route path="/library" element={<Library products={products} libraryIds={libraryIds} />} />
          <Route path="/profile" element={<Profile profile={profile} balance={balance} libraryIds={libraryIds} products={products} onLogout={() => supabase.auth.signOut()} />} />

          {/* Adicionado onUpdateProductStatus que estava faltando na rota Publish */}
          <Route path="/publish" element={<Publish products={products} onAddProduct={(p: any) => setProducts([p, ...products])} onUpdateProductStatus={(id: any, status: any) => { }} username={profile.username} />} />

          <Route path="/support" element={<Support products={products} username={profile.username} userRole={profile.role} />} />
          <Route path="/admin" element={profile.role === 'Admin' ? <AdminDashboard products={products} onSetProducts={setProducts} currentUsername={profile.username} /> : <Navigate to="/" replace />} />
          <Route path="/settings" element={<Settings profile={profile} settings={settings} onUpdateProfile={(upd: any) => setProfile({ ...profile, ...upd })} onUpdateSettings={(upd: any) => setSettings({ ...settings, ...upd })} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}