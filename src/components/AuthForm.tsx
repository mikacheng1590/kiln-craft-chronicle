
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you'd call your auth API here
    // For demo purposes, we'll just simulate a successful login/register
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (type === 'register') {
        toast.success('Account created successfully');
        navigate('/login');
      } else {
        toast.success('Login successful');
        navigate('/dashboard');
        // In a real app, you'd store the user token in local storage or a secure cookie
        localStorage.setItem('user', JSON.stringify({ id: '1', email: formData.email, name: 'Test User' }));
      }
    } catch (error) {
      toast.error('Authentication failed');
      console.error('Auth error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {type === 'login' ? 'Log In' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-center">
          {type === 'login' 
            ? 'Enter your details to access your pottery chronicles' 
            : 'Sign up to start documenting your pottery journey'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>
          
          <Button type="submit" className="w-full">
            {type === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === 'login' ? (
          <p className="text-sm text-center">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">
              Register
            </a>
          </p>
        ) : (
          <p className="text-sm text-center">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Log In
            </a>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
