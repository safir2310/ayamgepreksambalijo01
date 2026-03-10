'use client';

import { User, LogOut, Mail, Star, MapPin, Settings, Clock, Gift, Shield, Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ProfileView() {
  const { setCurrentView } = useUIStore();
  const { user, isAuthenticated, isAdmin, logout } = useUserStore();

  const menuItems = [
    { icon: User, label: 'Data Akun', onClick: () => setCurrentView('account-data') },
    { icon: MapPin, label: 'Alamat Tersimpan', onClick: () => setCurrentView('saved-addresses') },
    { icon: Clock, label: 'Riwayat Pesanan', onClick: () => setCurrentView('order-history') },
    { icon: User, label: 'Menu Favorit', onClick: () => setCurrentView('menu') },
    { icon: Gift, label: 'Poin & Reward', onClick: () => setCurrentView('points-rewards') },
    { icon: Sparkles, label: 'Tukar Poin', onClick: () => setCurrentView('rewards') },
    { icon: Settings, label: 'Pengaturan', onClick: () => setCurrentView('settings') },
  ];

  const adminMenuItems = isAdmin ? [
    { icon: Shield, label: 'Dashboard Admin', onClick: () => setCurrentView('admin-dashboard') },
  ] : [];

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Login Prompt */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">
              Selamat Datang!
            </h2>
            <p className="text-gray-500 mb-6">
              Login untuk pengalaman terbaik
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setCurrentView('login')}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-12"
              >
                Login
              </Button>
              <Button
                onClick={() => setCurrentView('register')}
                variant="outline"
                className="w-full h-12"
              >
                Daftar Akun Baru
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-[#E53935] text-white text-xl">
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold">
                {user.name || user.username || 'User'}
              </h2>
              {user.username && (
                <p className="text-sm text-gray-500">@{user.username}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{user.email || user.phone}</p>
              </div>
              {user.points !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-[#FFC107]" />
                  <p className="text-sm font-medium text-[#FFC107]">
                    {user.points} Poin
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Card>
        <CardContent className="p-2">
          <div className="divide-y">
            {[...adminMenuItems, ...menuItems].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                    item.label === 'Dashboard Admin' ? 'bg-[#E53935]/5' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    item.label === 'Dashboard Admin' ? 'text-[#E53935]' : 'text-gray-600'
                  }`} />
                  <span className={`flex-1 ${
                    item.label === 'Dashboard Admin' ? 'font-semibold text-[#E53935]' : ''
                  }`}>{item.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-400"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        onClick={handleLogout}
        className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  );
}
