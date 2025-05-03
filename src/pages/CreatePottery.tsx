
import PotteryForm from '@/components/PotteryForm';
import Navigation from '@/components/Navigation';

const CreatePottery = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold">Create New Pottery Record</h1>
      </header>
      
      <main className="flex-1 p-4">
        <PotteryForm />
      </main>
      
      <Navigation />
    </div>
  );
};

export default CreatePottery;
