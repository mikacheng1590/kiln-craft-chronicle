
import AuthForm from '@/components/AuthForm';
import Navigation from '@/components/Navigation';

const Register = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 px-4 py-12">
        <AuthForm type="register" />
      </main>
      
      <Navigation />
    </div>
  );
};

export default Register;
