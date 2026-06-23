import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Github, Chrome, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError('Falha na autenticação. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Falha no login com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Content Eco</h1>
          <p className="text-gray-400">Gerencie seu ecossistema de conteúdo</p>
        </div>

        <div className="flex bg-[#09090b] p-1 rounded-lg mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              isLogin ? "bg-[#27272a] text-white shadow-sm" : "text-gray-400 hover:text-white"
            )}
          >
            Entrar
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-2 rounded-md text-sm font-medium transition-all",
              !isLogin ? "bg-[#27272a] text-white shadow-sm" : "text-gray-400 hover:text-white"
            )}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg py-2.5 pl-10 pr-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272a]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#18181b] px-2 text-gray-500">Ou continue com</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Chrome className="w-4 h-4" />
          Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </p>
      </motion.div>
    </div>
  );
}
