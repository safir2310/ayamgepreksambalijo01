'use client';

import { useState } from 'react';
import { ArrowLeft, Bell, Shield, Info, HelpCircle, FileText, Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

export function SettingsView() {
  const { goBack } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const settingsItems = [
    {
      icon: Bell,
      label: 'Notifikasi Push',
      description: 'Terima notifikasi tentang pesanan dan promo',
      type: 'switch',
      value: notifications,
      onChange: setNotifications,
    },
    {
      icon: Bell,
      label: 'Notifikasi Email',
      description: 'Terima update via email',
      type: 'switch',
      value: emailNotifications,
      onChange: setEmailNotifications,
    },
    {
      icon: Moon,
      label: 'Mode Gelap',
      description: 'Ubah tampilan ke mode gelap',
      type: 'switch',
      value: theme === 'dark',
      onChange: (checked: boolean) => setTheme(checked ? 'dark' : 'light'),
    },
  ];

  const infoItems = [
    {
      icon: Shield,
      label: 'Kebijakan Privasi',
      description: 'Pelajari cara kami melindungi data Anda',
      action: () => console.log('Privacy Policy'),
    },
    {
      icon: FileText,
      label: 'Syarat & Ketentuan',
      description: 'Baca syarat dan ketentuan layanan',
      action: () => console.log('Terms and Conditions'),
    },
    {
      icon: HelpCircle,
      label: 'Bantuan & Dukungan',
      description: 'Hubungi kami jika membutuhkan bantuan',
      action: () => console.log('Help & Support'),
    },
    {
      icon: Info,
      label: 'Tentang Aplikasi',
      description: 'Informasi versi aplikasi',
      action: () => console.log('About App'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold">Pengaturan</h1>
      </div>

      {/* General Settings */}
      <Card>
        <CardContent className="p-2">
          <div className="divide-y">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={item.onChange}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Location Services */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Layanan Lokasi</p>
                <p className="text-xs text-gray-500">
                  Izinkan akses lokasi untuk pengiriman yang lebih akurat
                </p>
              </div>
            </div>
            <Switch
              checked={locationEnabled}
              onCheckedChange={setLocationEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info & Support */}
      <Card>
        <CardContent className="p-2">
          <div className="divide-y">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
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

      {/* App Version */}
      <div className="text-center text-sm text-gray-500 py-4">
        <p className="uppercase font-semibold">Ayam Geprek Sambal Ijo</p>
        <p className="text-xs">Versi 1.0.0</p>
      </div>
    </div>
  );
}
