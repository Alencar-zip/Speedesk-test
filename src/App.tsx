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

  // Stateful global products catalogue (Persisted so newly added/modified assets survive reloads)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('speedesk_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockProducts;
      }
    }
    return mockProducts;
  });

  // 1. Authentication Status State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('speedesk_is_logged_in');
    return saved === 'true'; // Default is false to show gating, but easily login
  });

  // 2. Global Wallet Balance State (Persisted)
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('speedesk_balance');
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) return parsed;
    }
    return 14850.00; // Base simulated premium R$ funds
  });

  // 3. Transactions Ledger State (Persisted)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('speedesk_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialTransactions;
      }
    }
    return initialTransactions;
  });

  // 4. User's Owned Digital Asset Library Items State (Persisted)
  const [libraryIds, setLibraryIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('speedesk_library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [6]; // Users own the 6th item as a starting showcase asset!
      }
    }
    return [6]; 
  });

  // 4b. Global user favorite list (Persisted)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('speedesk_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // 5. User biographical Profile State (Persisted)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('speedesk_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default
      }
    }
    return {
      username: "ProTrader99",
      email: "alex.trader@speedesk.io",
      bio: "Entusiasta de ativos digitais de alta fidelidade, colecionador de slides e criador de algoritmos inteligentes de alta performance baseados em blockchain.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgC4uQXopo7y3MwccZzzte0cJVY3c4i1Bq6BObMcuA_mP2K0EEb2utB_6F5w1qNJ7U6fp6qwd4EwLKE_kRLIwgh0gey7SEZe93Tg8DgwZxW4fMtnh1LClgZZ2cjciWIaKwXlU4M-4Yr8v3dZngtNqijVrz_lHZE8vJyVGVqtAHvB45NG270FvzQMWTjYTumWNygdX9h-da1wVaulBzv1kbfR1o_Nok0YzizEgcp1I66JwWyoQrG0p8GxaKC5X1QGe98a-96FHjuA",
      verified: true,
      memberSince: "Mar, 2026"
    };
  });

  // 6. User application configs state (Persisted)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('speedesk_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback default
      }
    }
    return {
      language: "pt-BR",
      theme: "dark",
      marketAlerts: true,
      transactionsAlerts: true,
      marketingAlerts: false,
      simulateMalware: false
    };
  });

  // 7. Global Search Query State (Flows from Layout Header down to pages)
  const [searchQuery, setSearchQuery] = useState('');

  // Save states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('speedesk_is_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('speedesk_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('speedesk_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('speedesk_library', JSON.stringify(libraryIds));
  }, [libraryIds]);

  useEffect(() => {
    localStorage.setItem('speedesk_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('speedesk_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('speedesk_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('speedesk_products', JSON.stringify(products));
  }, [products]);

  // Wallet operations callbacks
  const handleDeductBalance = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleAddFunds = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const handleWithdrawFunds = (amount: number): boolean => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  const triggerProductScanWithAPI = async (newProduct: Product, forceThreat: boolean) => {
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');

    try {
      const res = await fetch('/api/scan-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newProduct.title,
          fileName: newProduct.zipFileName || 'package.zip',
          fileSize: newProduct.specs.size,
          category: newProduct.category,
          format: newProduct.format,
          forceThreat: forceThreat
        })
      });

      if (!res.ok) {
        throw new Error(`Código de erro HTTP: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.logs && Array.isArray(data.logs)) {
        let cumulativeLogs = [
          { time: timestamp(), message: `Conexão estabelecida com o motor de análise antivírus da IA do Gemini.`, type: 'success' as const }
        ];

        setProducts(prev => prev.map(p => p.id === newProduct.id ? { ...p, scanLogs: cumulativeLogs } : p));

        data.logs.forEach((logItem: any, idx: number) => {
          setTimeout(() => {
            setProducts(prev => prev.map(p => {
              if (p.id === newProduct.id) {
                const logsSoFar = [...(p.scanLogs || []), logItem];
                
                if (idx === data.logs.length - 1) {
                  return {
                    ...p,
                    status: data.status,
                    scanSummary: data.summary,
                    scanLogs: logsSoFar
                  };
                }
                return {
                  ...p,
                  scanLogs: logsSoFar
                };
              }
              return p;
            }));
          }, (idx + 1) * 600);
        });
      } else {
        setProducts(prev => prev.map(p => p.id === newProduct.id ? {
          ...p,
          status: data.status,
          scanSummary: data.summary,
          scanLogs: data.logs || []
        } : p));
      }

    } catch (err: any) {
      console.error("Falha ao escanear com a API:", err);
      setProducts(prev => prev.map(p => {
        if (p.id === newProduct.id) {
          return {
            ...p,
            status: 'declined',
            scanSummary: 'Erro de Auditoria: Falha técnica ao responder.',
            scanLogs: [
              ...(p.scanLogs || []),
              { time: timestamp(), message: `Falha na barreira de conexão: ${err.message || err}`, type: 'error' },
              { time: timestamp(), message: `Ativo colocado preventivamente em quarentena técnica offline.`, type: 'warning' }
            ]
          };
        }
        return p;
      }));
    }
  };

  const handleAddProduct = (newProduct: Product, forceThreat: boolean = false) => {
    const timestamp = () => new Date().toLocaleTimeString('pt-BR');
    const enrichedProduct: Product = {
      ...newProduct,
      status: 'analyzing',
      scanSummary: 'O arquivo compactado foi enviado para o Sandbox de segurança e aguarda análise...',
      scanLogs: [
        { time: timestamp(), message: `Upload do arquivo compactado concluído com sucesso. [${newProduct.zipFileName || 'package.zip'}]`, type: 'success' },
        { time: timestamp(), message: `Iniciando auditoria antivírus Speedesc Sandbox baseada em IA...`, type: 'info' }
      ]
    };

    setProducts(prev => [enrichedProduct, ...prev]);

    // Kick off background AI malware scanner with API
    triggerProductScanWithAPI(enrichedProduct, forceThreat);
  };

  const handleUpdateProductStatus = (id: number, status: 'analyzing' | 'approved' | 'declined') => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleUpdateProductLogs = (id: number, status: 'analyzing' | 'approved' | 'declined', logs: any[], summary: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status, scanLogs: logs, scanSummary: summary } : p));
  };

  const handleAddToLibrary = (id: number) => {
    if (!libraryIds.includes(id)) {
      setLibraryIds(prev => [...prev, id]);
    }
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateSettings = (updated: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* Gateway Gated Access Check */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={(user) => {
                setProfile(user);
                setIsLoggedIn(true);
              }} />
            )
          } 
        />

        {/* Primary Secured Layout wrapping views */}
        <Route 
          element={
            isLoggedIn ? (
              <Layout 
                balance={balance} 
                profile={profile} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onLogout={() => setIsLoggedIn(false)}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          
          <Route 
            path="/" 
            element={
              <Marketplace 
                products={products} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
            } 
          />

          <Route 
            path="/product/:id" 
            element={
              <ProductDetails 
                products={products} 
                libraryIds={libraryIds}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />
            } 
          />

          <Route 
            path="/checkout/:id" 
            element={
              <Checkout 
                products={products} 
                balance={balance}
                onDeductBalance={handleDeductBalance}
                onAddTransaction={handleAddTransaction}
                onAddToLibrary={handleAddToLibrary}
              />
            } 
          />

          <Route 
            path="/wallet" 
            element={
              <Wallet 
                balance={balance} 
                transactions={transactions}
                onAddFunds={handleAddFunds}
                onWithdrawFunds={handleWithdrawFunds}
                onAddTransaction={handleAddTransaction}
              />
            } 
          />

          <Route 
            path="/library" 
            element={
              <Library 
                products={products} 
                libraryIds={libraryIds}
              />
            } 
          />

          <Route 
            path="/profile" 
            element={
              <Profile 
                profile={profile}
                balance={balance}
                libraryIds={libraryIds}
                products={products}
                onLogout={() => setIsLoggedIn(false)}
              />
            } 
          />

          <Route 
            path="/publish" 
            element={
              <Publish 
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
                username={profile.username}
                simulateMalware={settings.simulateMalware}
              />
            } 
          />

          <Route 
            path="/creator" 
            element={
              <CreatorPanel 
                products={products}
                onUpdateProductStatus={handleUpdateProductStatus}
                onUpdateProductLogs={handleUpdateProductLogs}
                username={profile.username}
              />
            } 
          />

          <Route 
            path="/support" 
            element={
              <Support 
                products={products}
                username={profile.username}
                userRole={profile.role}
              />
            } 
          />

          <Route 
            path="/admin" 
            element={
              profile.role === 'Admin' ? (
                <AdminDashboard 
                  products={products}
                  onSetProducts={setProducts}
                  currentUsername={profile.username}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          <Route 
            path="/settings" 
            element={
              <Settings 
                profile={profile}
                settings={settings}
                onUpdateProfile={handleUpdateProfile}
                onUpdateSettings={handleUpdateSettings}
              />
            } 
          />

        </Route>

        {/* Standard Fallback rerouter */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
