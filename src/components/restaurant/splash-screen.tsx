'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';

export function SplashScreen() {
  const { setCurrentView, currentView } = useUIStore();
  const { isAuthenticated, isAdmin, isCashier, hasHydrated } = useUserStore();

  useEffect(() => {
    // Wait for hydration to complete before redirecting
    const checkAuthAndRedirect = () => {
      if (!hasHydrated) {
        // If not hydrated yet, check again shortly
        setTimeout(checkAuthAndRedirect, 100);
        return;
      }

      const timer = setTimeout(() => {
        // If user is already on a valid page (not splash or login), keep them there
        if (currentView && currentView !== 'splash' && currentView !== 'login' && currentView !== 'register' && currentView !== 'forgot-password') {
          // Check if the current view matches their role
          if (isAdmin && currentView.startsWith('admin-')) {
            // Keep admin on their current page
            return;
          } else if (isCashier && currentView === 'cashier-pos') {
            // Keep cashier on POS
            return;
          } else if (isAuthenticated && !currentView.startsWith('admin-') && currentView !== 'cashier-pos') {
            // Keep regular user on their current page
            return;
          }
        }

        // Otherwise, redirect based on role
        if (isAdmin) {
          setCurrentView('admin-dashboard');
        } else if (isCashier) {
          setCurrentView('cashier-pos');
        } else {
          setCurrentView('home');
        }
      }, 800); // Slightly reduced delay

      return () => clearTimeout(timer);
    };

    checkAuthAndRedirect();
  }, [hasHydrated, isAuthenticated, isAdmin, isCashier, currentView, setCurrentView]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E53935] to-[#FFC107] relative overflow-hidden">
      {/* Background Pattern - Aceh Theme */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="grid grid-cols-8 grid-rows-8 gap-4 w-full h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="border border-white/20 rounded-sm"
                style={{
                  transform: `rotate(${i * 5}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
        className="relative z-10 text-center px-6"
      >
        {/* Logo Icon */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <ChefHat className="w-12 h-12 sm:w-16 sm:h-16 text-[#E53935]" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-4xl sm:text-6xl font-display font-bold text-white mb-2 drop-shadow-lg uppercase"
        >
          Ayam Geprek
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-xl sm:text-2xl font-semibold text-white/90 mb-4 uppercase"
        >
          Sambal Ijo
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-lg text-white/80 font-medium"
        >
          Pedasnya Bikin Nagih!
        </motion.p>
      </motion.div>

      {/* Loading Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-20 left-0 right-0"
      >
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
