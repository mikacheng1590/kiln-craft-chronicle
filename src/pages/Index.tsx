
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import AuthForm from '@/components/AuthForm';

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
          <AuthForm />
        </div>
      </main>
      
      <Navigation />
    </div>
  );
};

export default Index;
