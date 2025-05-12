import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white font-sans">
      <Navbar />
      <main className="flex-grow px-4 sm:px-8 py-6 max-w-screen-xl mx-auto w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
