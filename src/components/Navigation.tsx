
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, [location]);

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: isAuthenticated ? '/dashboard' : '/',
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
    {
      icon: User,
      label: 'Profile',
      path: isAuthenticated ? '/profile' : '/login',
      active: location.pathname === '/profile' || location.pathname === '/login',
    },
  ];

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
      </div>
    </nav>
  );
};

export default Navigation;
