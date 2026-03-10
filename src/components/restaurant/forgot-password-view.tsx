'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Step = 'request' | 'reset' | 'success';

export function ForgotPasswordView() {
  const { goBack } = useUIStore();
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestReset = async () => {
    if (!username || !email) {
      toast.error('Username dan email wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Email dan username cocok!');
        setStep('reset');
      } else {
        toast.error(data.error || 'Username dan email tidak cocok');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Gagal memproses permintaan');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Semua field wajib diisi');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password berhasil direset!');
        setStep('success');
      } else {
        toast.error(data.error || 'Gagal mereset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Gagal mereset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E53935]/10 to-[#FFC107]/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-display font-bold">Lupa Password</h1>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Card className="shadow-xl">
            <CardContent className="p-5 sm:p-6">
              <AnimatePresence mode="wait">
                {step === 'request' && (
                  <motion.div
                    key="request"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        className="w-14 h-14 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-3"
                      >
                        <Mail className="w-7 h-7 text-[#E53935]" />
                      </motion.div>
                      <h2 className="text-lg font-bold mb-1">Cari Akun</h2>
                      <p className="text-xs text-gray-500">
                        Masukkan username dan email yang terdaftar
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="username" className="text-xs font-medium">Username</Label>
                        <Input
                          id="username"
                          placeholder="Masukkan username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRequestReset()}
                          className="h-10 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Masukkan email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRequestReset()}
                          className="h-10 text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleRequestReset}
                      disabled={loading}
                      className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 text-sm font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Memproses...
                        </>
                      ) : (
                        'Cari Akun'
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === 'reset' && (
                  <motion.div
                    key="reset"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                        className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
                      >
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      </motion.div>
                      <h2 className="text-lg font-bold mb-1">Reset Password</h2>
                      <p className="text-xs text-gray-500">
                        Akun ditemukan! Buat password baru
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="newPassword" className="text-xs font-medium">Password Baru</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 6 karakter"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                            className="h-10 pl-3 pr-10 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="confirmPassword" className="text-xs font-medium">Konfirmasi Password</Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Ulangi password baru"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                          className="h-10 text-sm"
                        />
                      </div>

                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-red-600 text-xs"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Password tidak cocok</span>
                        </motion.div>
                      )}

                      {newPassword && newPassword.length < 6 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-red-600 text-xs"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Password minimal 6 karakter</span>
                        </motion.div>
                      )}
                    </div>

                    <Button
                      onClick={handleResetPassword}
                      disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                      className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 text-sm font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Memproses...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setStep('request')}
                      className="w-full h-9 text-sm"
                    >
                      Kembali
                    </Button>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4 py-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </motion.div>
                    <div>
                      <h2 className="text-lg font-bold mb-1">Password Berhasil!</h2>
                      <p className="text-xs text-gray-500">
                        Silakan login dengan password baru
                      </p>
                    </div>
                    <Button
                      onClick={goBack}
                      className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 text-sm font-semibold"
                    >
                      Login Sekarang
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {step !== 'success' && (
          <div className="text-center mt-4 text-xs">
            <p className="text-gray-500">
              Ingat password?{' '}
              <button
                onClick={goBack}
                className="text-[#E53935] font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
