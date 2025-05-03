
import AuthForm from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

const Login = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 py-12">
        <AuthForm type="login" />
      </main>
      
      <Navigation />
    </div>
  );
};

export default Login;
