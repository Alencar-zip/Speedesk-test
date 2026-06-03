import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* COLE AQUI O SEU HEADER DO GOOGLE AI */}
      <header> ... </header>

      {/* COLE AQUI A SUA SIDEBAR (MENU LATERAL) */}
      <aside>
         {/* MUDE os <a href="wallet.html"> para <Link to="/wallet"> */}
         <Link to="/wallet" className="...">Carteira</Link>
      </aside>

      {/* O Outlet é onde o conteúdo das páginas vai aparecer */}
      <main className="pt-24 px-6">
        <Outlet />
      </main>
    </div>
  );
};
export default Layout;
