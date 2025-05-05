
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: user ? '/dashboard' : '/',
      active: location.pathname === '/dashboard' || location.pathname === '/',
    },
    {
      icon: Search,
      label: 'Search',
      path: '/search',
      active: location.pathname === '/search',
    },
    {
      icon: PlusCircle,
      label: 'Create',
      path: '/create',
      active: location.pathname === '/create',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-4">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full",
              item.active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={24} className={cn(item.active ? "text-primary" : "text-muted-foreground")} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        
        {user && (
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center w-16 h-full text-muted-foreground"
          >
            <LogOut size={24} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
