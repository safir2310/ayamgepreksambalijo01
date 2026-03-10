'use client';

import { useUIStore } from '@/store/ui-store';
import { BottomNavigation } from '@/components/restaurant/bottom-navigation';
import { CartSheet } from '@/components/restaurant/cart-sheet';
import { SplashScreen } from '@/components/restaurant/splash-screen';
import { HomeView } from '@/components/restaurant/home-view';
import { MenuView } from '@/components/restaurant/menu-view';
import { MenuDetailView } from '@/components/restaurant/menu-detail-view';
import { CartView } from '@/components/restaurant/cart-view';
import CheckoutView from '@/components/restaurant/checkout-view';
import { OrderStatusView } from '@/components/restaurant/order-status-view';
import { ProfileView } from '@/components/restaurant/profile-view';
import { LoginView } from '@/components/restaurant/login-view';
import { RegisterView } from '@/components/restaurant/register-view';
import { OrderHistoryView } from '@/components/restaurant/order-history-view';
import { AccountDataView } from '@/components/restaurant/account-data-view';
import { SavedAddressesView } from '@/components/restaurant/saved-addresses-view';
import { PointsRewardsView } from '@/components/restaurant/points-rewards-view';
import { RewardsView } from '@/components/restaurant/rewards-view';
import { SettingsView } from '@/components/restaurant/settings-view';
import { AdminDashboardView } from '@/components/restaurant/admin-dashboard-view';
import { AdminOrdersView } from '@/components/restaurant/admin-orders-view';
import { AdminMenuView } from '@/components/restaurant/admin-menu-view';
import { AdminFinancialReportView } from '@/components/restaurant/admin-financial-report-view';
import { AdminRewardsView } from '@/components/restaurant/admin-rewards-view';
import { CashierManagementView } from '@/components/restaurant/cashier-management-view';
import { CashierPOSView } from '@/components/restaurant/cashier-pos-view';
import { ForgotPasswordView } from '@/components/restaurant/forgot-password-view';

export default function AyamGeprekApp() {
  const { currentView, showCart } = useUIStore();

  const isSplashScreen = currentView === 'splash';
  const isAuthPage = ['login', 'register', 'forgot-password'].includes(currentView);
  const isAdminPage = currentView.startsWith('admin-') || currentView === 'cashier-management' || currentView === 'cashier-pos';

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashScreen />;
      case 'home':
        return <HomeView />;
      case 'menu':
        return <MenuView />;
      case 'menu-detail':
        return <MenuDetailView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-status':
        return <OrderStatusView />;
      case 'profile':
        return <ProfileView />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <RegisterView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'order-history':
        return <OrderHistoryView />;
      case 'account-data':
        return <AccountDataView />;
      case 'saved-addresses':
        return <SavedAddressesView />;
      case 'points-rewards':
        return <PointsRewardsView />;
      case 'rewards':
        return <RewardsView />;
      case 'settings':
        return <SettingsView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'admin-orders':
        return <AdminOrdersView />;
      case 'admin-menu':
        return <AdminMenuView />;
      case 'admin-financial-report':
        return <AdminFinancialReportView />;
      case 'admin-rewards':
        return <AdminRewardsView />;
      case 'cashier-management':
        return <CashierManagementView />;
      case 'cashier-pos':
        return <CashierPOSView />;
      default:
        return <HomeView />;
    }
  };

  const showBottomNav = !isSplashScreen && !isAuthPage && !isAdminPage &&
    !['checkout', 'order-status', 'menu-detail'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <main className="flex-1">
        {renderView()}
      </main>

      {showBottomNav && (
        <>
          <div className="h-16"></div>
          <BottomNavigation />
        </>
      )}

      <CartSheet />
    </div>
  );
}
