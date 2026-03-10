'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginView() {
  const { setCurrentView } = useUIStore();
  const { setUser } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);

        // Redirect based on role
        if (data.user.role === 'cashier') {
          setCurrentView('cashier-pos');
        } else if (data.user.role === 'admin') {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('home');
        }
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E53935] to-[#FFC107] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView('home')}
          className="mb-3 text-white hover:bg-white/20 h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Card className="shadow-xl">
            <CardContent className="p-5 sm:p-6">
              {/* Header */}
              <div className="text-center mb-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className="w-14 h-14 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <User className="w-7 h-7 text-[#E53935]" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                  className="text-xl sm:text-2xl font-display font-bold mb-1"
                >
                  Selamat Datang!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-sm text-gray-500"
                >
                  Login untuk memesan Ayam Geprek
                </motion.p>
              </div>

              {/* Login Form */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-xs text-red-600">{error}</p>
                  </motion.div>
                )}

                <div>
                  <Label htmlFor="username" className="text-xs font-medium">Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-10 pl-9 text-sm"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pl-9 text-sm"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentView('forgot-password')}
                      className="text-xs text-[#E53935] hover:underline"
                    >
                      Lupa Password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 font-semibold text-sm"
                  disabled={loading || !username.trim() || !password.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </motion.form>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-gray-500">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentView('register')}
                    className="text-[#E53935] font-semibold hover:underline"
                  >
                    Daftar Sekarang
                  </button>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
