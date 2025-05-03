
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already authenticated
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 py-12 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-6">Kiln Craft Chronicle</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Document your pottery journey from clay to final glaze. Keep track of your process, techniques, and results.
          </p>
          
          <div className="space-y-4">
            <Button onClick={() => navigate('/login')} size="lg" className="w-full text-lg">
              Log In
            </Button>
            <Button onClick={() => navigate('/register')} variant="outline" size="lg" className="w-full text-lg">
              Create Account
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
              <h3 className="font-medium mb-2">Greenware</h3>
              <p className="text-xs">Document your starting clay journey</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
              <h3 className="font-medium mb-2">Bisque</h3>
              <p className="text-xs">Track your first firing stage</p>
            </div>
            <div className="p-4 rounded-lg bg-accent text-accent-foreground text-center">
              <h3 className="font-medium mb-2">Final</h3>
              <p className="text-xs">Showcase your finished pieces</p>
            </div>
          </div>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
};

export default Index;
