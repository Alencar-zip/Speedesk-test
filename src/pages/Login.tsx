import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) alert('Erro no cadastro: ' + error.message);
      else alert('Sucesso! Verifique seu e-mail para confirmar a conta.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('Erro ao entrar: ' + error.message);
      else onLogin(data.user);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-bold text-primary mb-6 tracking-tighter">
          {isRegistering ? 'Criar Conta Speedesk' : 'Entrar no Núcleo'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-[10px] font-mono text-on-surface-variant uppercase">Nome de Usuário</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-primary" required />
            </div>
          )}
          <div>
            <label className="text-[10px] font-mono text-on-surface-variant uppercase">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-primary" required />
          </div>
          <div>
            <label className="text-[10px] font-mono text-on-surface-variant uppercase">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:border-primary" required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-black font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
            {loading ? 'PROCESSANDO...' : isRegistering ? 'REGISTRAR' : 'ACESSAR SISTEMA'}
          </button>
        </form>

        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-xs text-on-surface-variant hover:text-primary transition-colors">
          {isRegistering ? 'Já tem conta? Clique para Entrar' : 'Novo por aqui? Crie sua conta grátis'}
        </button>
      </div>
    </div>
  );
}
