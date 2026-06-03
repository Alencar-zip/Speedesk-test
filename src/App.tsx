import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Marketplace from './pages/Marketplace';
import Wallet from './pages/Wallet';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* O Layout contém sua Sidebar e Header que você já desenhou */}
        <Route element={<Layout />}>
          <Route path="/" element={<Marketplace />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
