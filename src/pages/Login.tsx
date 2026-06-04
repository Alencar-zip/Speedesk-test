import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

interface StoredUser {
  username: string;
  email: string;
  password?: string;
  bio: string;
  avatar: string;
  role: 'Admin' | 'Moderador' | 'Criador' | 'Comprador' | 'Suporte';
  verified: boolean;
  memberSince: string;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration form states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Admin' | 'Moderador' | 'Criador' | 'Comprador' | 'Suporte'>('Criador');
  const [regBio, setRegBio] = useState('');

  // Initial database of pre-seeded accounts
  const [usersDb, setUsersDb] = useState<StoredUser[]>(() => {
    const defaultUsers: StoredUser[] = [
      {
        username: 'admin',
        email: 'admin@speedesk.io',
        password: 'admin',
        role: 'Admin',
        bio: 'Administrador Geral da rede Speedesk. Auditoria, controle completo de segurança interna e balanceamento.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        verified: true,
        memberSince: 'Jun, 2026'
      },
      {
        username: 'suporte',
        email: 'suporte@speedesk.io',
        password: 'suporte',
        role: 'Suporte',
        bio: 'Membro oficial do time de Suporte e Atendimento Speedesk.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
        verified: true,
        memberSince: 'Jun, 2026'
      },
      {
        username: 'cliente',
        email: 'cliente@speedesk.io',
        password: 'cliente',
        role: 'Comprador',
        bio: 'Cliente ativo do ecossistema Speedesk, buscando slides de alta fidelidade.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
        verified: true,
        memberSince: 'Jun, 2026'
      },
      {
        username: 'ProTrader99',
        email: 'alex.trader@speedesk.io',
        password: 'password',
        role: 'Criador',
        bio: 'Entusiasta de ativos digitais de alta fidelidade, colecionador de slides e layouts profissionais Figma.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        verified: true,
        memberSince: 'Mar, 2026'
      }
    ];

    const saved = localStorage.getItem('speedesk_registered_users_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const updated = [...parsed];
          defaultUsers.forEach(du => {
            if (!updated.some(u => u.username.toLowerCase() === du.username.toLowerCase())) {
              updated.push(du);
            }
          });
          return updated;
        }
      } catch (e) {
        // use default
      }
    }
    return defaultUsers;
  });

  // Save users database
  useEffect(() => {
    localStorage.setItem('speedesk_registered_users_db', JSON.stringify(usersDb));
  }, [usersDb]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const match = usersDb.find(u => 
        (u.username.toLowerCase() === loginUsername.toLowerCase() || u.email.toLowerCase() === loginUsername.toLowerCase()) &&
        (u.password === loginPassword)
      );

      if (match) {
        const userProfile: UserProfile = {
          username: match.username,
          email: match.email,
          bio: match.bio,
          avatar: match.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256",
          verified: match.verified,
          memberSince: match.memberSince,
          role: match.role
        };
        onLogin(userProfile);
        setLoading(false);
        navigate('/');
      } else {
        setLoading(false);
        setError('Pseudônimo/E-mail ou Assinatura Secreta inválida na pilha de segurança.');
      }
    }, 1000);
  };

  // Handle Registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!regUsername.trim()) {
      setError('Informe um pseudônimo válido de trader.');
      return;
    }
    if (usersDb.some(u => u.username.toLowerCase() === regUsername.toLowerCase().trim())) {
      setError('Este nome de usuário já está registrado na rede.');
      return;
    }
    if (usersDb.some(u => u.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      setError('Este e-mail já está em uso.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Dynamic avatars based on chosen roles
      const defaultAvatar = regRole === 'Admin' 
        ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=256'
        : regRole === 'Suporte' 
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256';

      const newUser: StoredUser = {
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        bio: regBio.trim() || 'Usuário recém-registrado no ecossistema Speedesk.',
        avatar: defaultAvatar,
        verified: true,
        memberSince: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      };

      // Add to db state
      setUsersDb(prev => [...prev, newUser]);

      // Map to UserProfile and automatically log in
      const userProfile: UserProfile = {
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatar: newUser.avatar,
        verified: newUser.verified,
        memberSince: newUser.memberSince,
        role: newUser.role
      };

      onLogin(userProfile);
      setLoading(false);
      navigate('/');
    }, 1200);
  };

  // One-click quick tester login helper
  const handleQuickLogin = (testUser: string) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const match = usersDb.find(u => u.username === testUser);
      if (match) {
        const userProfile: UserProfile = {
          username: match.username,
          email: match.email,
          bio: match.bio,
          avatar: match.avatar,
          verified: match.verified,
          memberSince: match.memberSince,
          role: match.role
        };
        onLogin(userProfile);
        setLoading(false);
        navigate('/');
      } else {
        setLoading(false);
        setError('Erro interno ao iniciar sessão de teste.');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#101415] flex items-center justify-center p-4 overflow-y-auto font-body select-none">
      
      {/* Decorative glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#c0c1ff]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Auth Box Container */}
      <div className="bg-[#1d2022] border border-white/5 max-w-lg w-full rounded-3xl p-6 md:p-8 shadow-2xl relative space-y-6 my-8 text-center">
        
        {/* Portal Logo */}
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-container mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(0,224,255,0.4)]">
            <span className="material-symbols-outlined text-black font-extrabold text-2xl select-none">admin_panel_settings</span>
          </div>
          <div>
            <span className="text-2xl font-black font-display text-white tracking-widest uppercase">SPEEDESK</span>
            <span className="text-[10px] font-mono text-primary uppercase block tracking-widest mt-1 font-bold">Autenticação e Registro de Operador</span>
          </div>
        </div>

        {/* Error Alert bar */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-4 rounded-xl text-left font-mono">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <h3 className="text-sm font-mono text-primary font-bold uppercase tracking-widest">Acessando Banco de Chaves...</h3>
            <p className="text-[11px] text-on-surface-variant max-w-xs mx-auto leading-relaxed uppercase">
              Auditando perfis de faturamento e tokens cripto no Sandbox do Cloud Run
            </p>
          </div>
        ) : (
          <>
            {/* VIEW MODE: REGISTER ACCOUNT FORM */}
            {isRegisterMode ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pseudonym */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Pseudônimo (Usuário)</label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-3 px-4 text-xs font-mono text-white outline-none"
                      placeholder="Ex: trader_expert"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-3 px-4 text-xs font-mono text-white outline-none"
                      placeholder="Ex: joao@speedesk.io"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Senha de Acesso</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-3 px-4 text-xs font-mono text-white outline-none"
                      placeholder="Escolha uma senha"
                    />
                  </div>
                </div>

                {/* Biographical details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Minibiografia / Descrição do Perfil</label>
                  <textarea
                    rows={2}
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-2 px-4 text-xs font-mono text-white outline-none"
                    placeholder="Fale um pouco sobre você ou sua empresa..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-black font-extrabold py-3.5 rounded-xl hover:scale-101 transition-all cursor-pointer text-xs font-mono tracking-wider shadow-lg uppercase"
                >
                  Registrar e Entrar
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError('');
                    }}
                    className="text-xs text-on-surface-variant hover:text-white underline cursor-pointer"
                  >
                    Já possui uma chave? Voltar ao Login
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE: STANDARD SIGN-IN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Pseudônimo ou E-mail</label>
                  <div className="relative">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm absolute left-4 top-1/2 -translate-y-1/2">alternate_email</span>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-3 px-4 pl-11 text-xs font-mono text-white outline-none"
                      placeholder="Nome de trader ou e-mail"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Assinatura Secreta</label>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm absolute left-4 top-1/2 -translate-y-1/2">lock_open</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#101415] border border-white/10 focus:border-primary rounded-xl py-3 px-4 pl-11 pr-10 text-xs font-mono text-white outline-none"
                      placeholder="Senha do usuário"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-black font-extrabold py-3.5 rounded-xl hover:scale-101 transition-all cursor-pointer text-xs font-mono tracking-wider shadow-lg flex justify-center items-center gap-2 uppercase"
                >
                  <span className="material-symbols-outlined text-base">vpn_key</span>
                  Acessar Workspace
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                    }}
                    className="text-xs text-primary hover:underline font-bold cursor-pointer"
                  >
                    Não possui uma conta? Registre uma agora!
                  </button>
                </div>
              </form>
            )}

            {/* DEMO LOGINS GUIDELINES INDICATOR */}
            {!isRegisterMode && (
              <div className="border-t border-white/5 pt-4 text-center space-y-1 bg-[#161a1b]/40 rounded-2xl p-3.5 border border-white/5">
                <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest block">
                  CONTAS DE ACESSO DE DEMONSTRAÇÃO
                </span>
                <p className="text-[10px] font-mono text-white/60 leading-relaxed">
                  Para analisar cada ambiente, digite no formulário de login (Usuário / Senha):
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-2 text-[9px] font-mono">
                  <div className="bg-[#1c2122] rounded-xl p-1.5 border border-white/5">
                    <span className="text-primary font-bold block">Admin</span>
                    <span className="text-[#bac9cd]/75">admin / admin</span>
                  </div>
                  <div className="bg-[#1c2122] rounded-xl p-1.5 border border-white/5">
                    <span className="text-[#c0c1ff] font-bold block font-sans uppercase text-[7.5px]">Suporte</span>
                    <span className="text-[#bac9cd]/75">suporte / suporte</span>
                  </div>
                  <div className="bg-[#1c2122] rounded-xl p-1.5 border border-white/5">
                    <span className="text-yellow-400 font-bold block font-sans uppercase text-[7.5px]">Cliente</span>
                    <span className="text-[#bac9cd]/75 font-sans">cliente / cliente</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="border-t border-white/5 pt-4 text-center">
          <p className="text-[9px] font-mono text-on-surface-variant/40 uppercase tracking-widest leading-none">
            Speedesk Secure Gateway • Crypto Shield Active
          </p>
        </div>

      </div>
    </div>
  );
}

