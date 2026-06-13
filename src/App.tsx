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
import { Product, Transaction, UserProfile, UserRole } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [libraryIds, setLibraryIds] = useState<(number | string)[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<(number | string)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    username: "Carregando...",
    email: "",
    bio: "Membro Speedesk",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgC4uQXopo7y3MwccZzzte0cJVY3c4i1Bq6BObMcuA_mP2K0EEb2utB_6F5w1qNJ7U6fp6qwd4EwLKE_kRLIwgh0gey7SEZe93Tg8DgwZxW4fMtnh1LClgZZ2cjciWIaKwXlU4M-4Yr8v3dZngtNqijVrz_lHZE8vJyVGVqtAHvB45NG270FvzQMWTjYTumWNygdX9h-da1wVaulBzv1kbfR1o_Nok0YzizEgcp1I66JwWyoQrG0p8GxaKC5X1QGe98a-96FHjuA",
    verified: false,
    memberSince: "2026",
    role: "User" as UserRole
  });

  const fetchUserData = async (user: any) => {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: walletData } = await supabase.from('wallet').select('*').eq('user_id', user.id).single();
    const { data: transData } = await supabase.from('transactions').select('*').eq('buyer_id', user.id);

    setProfile({
      username: profileData?.username || user.email.split('@')[0],
      email: user.email || "",
      bio: profileData?.bio || "Membro Speedesk",
      avatar: profileData?.avatar_url || "https://sua-imagem-padrao.png",
      verified: profileData?.role === 'Admin',
      memberSince: "2026",
      role: (profileData?.role as UserRole) || ("User" as UserRole)
    });

    if (walletData) setBalance(Number(walletData.available_balance));
    if (transData) setTransactions(transData as unknown as Transaction[]);
  };

  const fetchMarketplace = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;

      if (data && data.length > 0) {
        const realProducts = data.map(p => ({
          ...p,
          id: p.id, 
          price: Number(p.price) || 0,
          img: p.img || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000",
          specs: p.specs || { resolution: '1920x1080', software: 'Multi', size: '10MB', updates: 'Sim' }
        }));
        setProducts([...realProducts, ...mockProducts] as Product[]);
      } else {
        setProducts(mockProducts);
      }
    } catch (err) {
      setProducts(mockProducts);
    }
  };

  useEffect(() => {
    fetchMarketplace();
    const checkSession = async () => {
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

    checkSession();
    return () => subscription.unsubscribe();
  }, []);

  const handleStripeCheckout = async (productId: number | string) => {
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
    } catch (e) { alert("Ligue o motor financeiro!"); }
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

          {/* CORREÇÃO: Passando o searchQuery real para o Marketplace */}
          <Route path="/" element={
            <Marketplace 
              products={products} 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              favoriteIds={favoriteIds as any} 
              onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} 
            />
          } />
          
          <Route path="/product/:id" element={<ProductDetails products={products} libraryIds={libraryIds as any} favoriteIds={favoriteIds as any} onToggleFavorite={(id) => setFavoriteIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])} />} />
          
          <Route path="/checkout/:id" element={<Checkout products={products} balance={balance} onConfirmStripe={handleStripeCheckout as any} onDeductBalance={(amt) => { setBalance(prev => prev - amt); return true; }} onAddTransaction={(tx) => setTransactions([tx, ...transactions])} onAddToLibrary={(id) => setLibraryIds([...libraryIds, id])} />} />
          <Route path="/wallet" element={<Wallet balance={balance} transactions={transactions} onAddFunds={(a) => setBalance(b => b + a)} onWithdrawFunds={(a) => { setBalance(b => b - a); return true; }} onAddTransaction={(t) => setTransactions([t, ...transactions])} />} />
          <Route path="/library" element={<Library products={products} libraryIds={libraryIds as any} />} />
          <Route path="/profile" element={<Profile profile={profile} balance={balance} libraryIds={libraryIds as any} products={products} onLogout={() => supabase.auth.signOut()} />} />
          <Route path="/publish" element={<Publish products={products} onAddProduct={() => fetchMarketplace()} onUpdateProductStatus={() => { }} username={profile.username} />} />
          <Route path="/creator" element={<CreatorPanel products={products} onUpdateProductStatus={() => { }} onUpdateProductLogs={() => { }} username={profile.username} />} />
          <Route path="/support" element={<Support products={products} username={profile.username} userRole={profile.role} />} />
          <Route path="/admin" element={profile.role === 'Admin' ? <AdminDashboard products={products} onSetProducts={setProducts} currentUsername={profile.username} /> : <Navigate to="/" />} />
          <Route path="/settings" element={<Settings profile={profile} settings={{} as any} onUpdateProfile={(u) => setProfile({ ...profile, ...u })} onUpdateSettings={() => { }} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}