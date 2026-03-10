'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Phone, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterView() {
  const { setCurrentView } = useUIStore();
  const { setUser } = useUserStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username dan password wajib diisi');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name || formData.username,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setSuccess(true);
        setUser(data.user);
        // Redirect to home after 1.5 seconds
        setTimeout(() => {
          setCurrentView('home');
        }, 1500);
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Register error:', error);
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
          onClick={() => setCurrentView('login')}
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
                  className="w-14 h-14 bg-[#FFC107]/20 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <User className="w-7 h-7 text-[#E53935]" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                  className="text-xl sm:text-2xl font-display font-bold mb-1"
                >
                  Buat Akun
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-sm text-gray-500"
                >
                  Daftar untuk mulai pesan
                </motion.p>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Registrasi Berhasil!</p>
                    <p className="text-xs text-green-600">Mengalihkan ke beranda...</p>
                  </div>
                </motion.div>
              )}

              {/* Register Form */}
              {!success && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  onSubmit={handleRegister}
                  className="space-y-3"
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
                    <Label htmlFor="username" className="text-xs font-medium">Username *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Masukkan username"
                        value={formData.username}
                        onChange={handleChange}
                        className="h-10 pl-9 text-sm"
                        disabled={loading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-xs font-medium">Nama Lengkap (Opsional)</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-10 mt-1 text-sm"
                      disabled={loading}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium">Nomor WhatsApp (Opsional)</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-10 pl-9 text-sm"
                        disabled={loading}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-xs font-medium">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-10 pl-9 text-sm"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-xs font-medium">Konfirmasi Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Ulangi password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="h-10 pl-9 text-sm"
                        disabled={loading}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 font-semibold text-sm mt-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Daftar'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* Login Link */}
              {!success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="mt-4 text-center"
                >
                  <p className="text-xs text-gray-500">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentView('login')}
                      className="text-[#E53935] font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
