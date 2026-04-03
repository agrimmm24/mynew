import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, User, ArrowRight, Activity, Terminal } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/admin/auth/login', {
        email,
        password
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', 'ADMIN');
      localStorage.setItem('adminEmail', email);
      
      window.location.href = '/';
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.response?.data?.detail || "Authorization sync failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#111218] backdrop-blur-3xl border border-gray-800 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>

          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(220,38,38,0.4)] relative"
            >
                <div className="absolute inset-0 bg-red-600 rounded-2xl animate-ping opacity-20"></div>
                <ShieldCheck size={40} className="text-white relative z-10" />
            </motion.div>
            
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
              ADMIN <span className="text-red-600">PORTAL</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              Secure Gateway Link v2.0
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User size={12} className="text-red-500" /> Administrative ID
              </label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.root@sys.loc" 
                  required
                  className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-2xl px-6 py-5 text-white font-medium outline-none focus:ring-1 focus:ring-red-600 transition-all appearance-none placeholder:text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-red-500" /> Access Key
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required
                  className="w-full bg-gray-900 border-gray-800 border border-gray-800 rounded-2xl px-6 py-5 text-white font-medium outline-none focus:ring-1 focus:ring-red-600 transition-all appearance-none placeholder:text-gray-800 tracking-widest"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
                >
                  <Activity size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-900/40 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group/btn mt-8 overflow-hidden relative"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Initiate Secure Link
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-800 flex items-center justify-between text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-red-600" />
              SYSTEM_READY
            </div>
            <div>ENC: RSA_4096</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
