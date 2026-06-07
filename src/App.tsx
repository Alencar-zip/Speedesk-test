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
import { mockProducts } from './data/mockData'; // Mantido apenas como fallback
import { Product, Transaction, UserProfile, UserRole } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]); // Começa vazio para carregar do banco
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [libraryIds, setLibraryIds] = useState<number[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    username: "...", email: "", bio: "", avatar: "", verified: false, memberSince: "", role: "Usuário" as UserRole
  });

  // --- 1. CARREGAR CATALOGO DE PRODUTOS REAIS ---
  const fetchMarketplace = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');
    
    if (!error && data) {
      setProducts(data as Product[]);
    } else {
      setProducts(mockProducts); // Se o banco estiver vazio, mostra os mockados para não ficar em branco
    }
  };

  // --- 2. BUSCAR DADOS DO USUÁRIO LOGADO ---
  const fetchUserData = async (user: any) => {
    // Busca Perfil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    // Busca Saldo
    const { data: walletData } = await supabase.from('wallet').select('*').eq('user_id', user.id).single();
    
    // Busca Transações (Histórico Real)
    const { data: transData } = await supabase
      .from('transactions')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (profileData) {
      setProfile({
        username: profileData.username,
        email: user.email,
        bio: profileData.bio,
        avatar: profileData.avatar_url || "https://sua-imagem-padrao.png",
        verified: true,
        memberSince: new Date(profileData.created_at).getFullYear().toString(),
        role: profileData.role as UserRole
      });
    }

    if (walletData) {
      setBalance(Number(walletData.available_balance));
    }

    if (transData) {
      setTransactions(transData as unknown as Transaction[]);
    }
  };

  // --- 3. INICIALIZAÇÃO E OBSERVAÇÃO DE AUTH ---
  useEffect(() => {
    fetchMarketplace(); // Carrega a loja independente de estar logado

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
        setTransactions([]);
      }
    });

    initApp();
    return () => subscription.unsubscribe();
  }, []);

  // --- 4. LÓGICA FINANCEIRA (STRIPE) ---
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
    } catch (e) {
      alert("Motor financeiro offline!");
    }
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
            searchQuery="" 
            onSearchChange={() => {}} 
            onLogout={() => supabase.auth.signOut()} 
          />
        ) : <Navigate to="/login" />}>
          
          <Route path="/" element={<Marketplace products={products} searchQuery="" onSearchChange={() => {}} favoriteIds={[]} onToggleFavorite={() => {}} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} libraryIds={libraryIds} favoriteIds={[]} onToggleFavorite={() => {}} />} />
          
          <Route path="/checkout/:id" element={
            <Checkout 
              products={products} 
              balance={balance} 
              onConfirmStripe={handleStripeCheckout}
              onDeductBalance={(amt) => { setBalance(prev => prev - amt); return true; }}
              onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
              onAddToLibrary={(id) => setLibraryIds(prev => [...prev, id])}
            />
          } />

          <Route path="/wallet" element={<Wallet balance={balance} transactions={transactions} onAddFunds={(a) => setBalance(b => b + a)} onWithdrawFunds={(a) => {setBalance(b => b - a); return true;}} onAddTransaction={(t) => setTransactions(prev => [t, ...prev])} />} />
          
          <Route path="/library" element={<Library products={products} libraryIds={libraryIds}/>} />
          <Route path="/profile" element={<Profile profile={profile} balance={balance} libraryIds={libraryIds} products={products} onLogout={() => supabase.auth.signOut()} />} />
          <Route path="/publish" element={<Publish products={products} onAddProduct={(p) => setProducts(prev => [p, ...prev])} onUpdateProductStatus={() => {}} username={profile.username} />} />
          <Route path="/creator" element={<CreatorPanel products={products} onUpdateProductStatus={() => {}} onUpdateProductLogs={() => {}} username={profile.username} />} />
          <Route path="/support" element={<Support products={products} username={profile.username} userRole={profile.role} />} />
          
          <Route path="/admin" element={profile.role === 'Admin' ? <AdminDashboard products={products} onSetProducts={setProducts} currentUsername={profile.username} /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Settings profile={profile} settings={{} as any} onUpdateProfile={(u) => setProfile({...profile, ...u})} onUpdateSettings={() => {}} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}