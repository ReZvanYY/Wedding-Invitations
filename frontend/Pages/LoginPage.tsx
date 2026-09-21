import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = (import.meta as ImportMeta & {
        env?: { VITE_API_URL?: string };
      }).env?.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Noe gikk galt under innloggingen.');
      }

      // Save user and token to Context and LocalStorage
      login(data.user, data.accessToken);

      // Redirect the user back to the Home page
      navigate('/');
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('En ukjent feil oppstod.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center px-6 py-12 lg:py-24 z-10">
      
      <div className="w-full max-w-lg bg-white/60 backdrop-blur-md rounded-4 p-8 md:p-12 shadow-xl border border-purple-100 flex flex-col items-center">
        
        <h2 className="text-4xl font-['Great_Vibes'] text-[#42275a] mb-2">
          Velkommen tilbake
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm font-bold tracking-[0.2rem] text-[#5e4b68] uppercase mb-8 w-full">
          <div className="w-8 h-px bg-[#d4af37]"></div>
          <span className="whitespace-nowrap">Logg inn</span>
          <div className="w-8 h-px bg-[#d4af37]"></div>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[0.75rem] font-bold tracking-[0.1rem] uppercase text-[#5e4b68]">
              E-postadresse
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white/80 border border-purple-200 rounded-lg px-4 py-3 text-[#4a3b52] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition-all shadow-sm"
              placeholder="din.epost@eksempel.no"
            />
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label htmlFor="password" className="text-[0.75rem] font-bold tracking-[0.1rem] uppercase text-[#5e4b68]">
              Passord
            </label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-white/80 border border-purple-200 rounded-lg px-4 py-3 text-[#4a3b52] focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition-all shadow-sm"
              placeholder="Ditt passord"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#42275a] hover:bg-[#2d1b3e] disabled:bg-[#42275a]/70 text-white text-[0.875rem] font-bold tracking-[0.15rem] uppercase py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2"
          >
            {isLoading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>

        <div className="mt-8 text-sm text-[#5e4b68]">
          Har du ikke en konto ennå?{' '}
          <Link to="/register" className="font-bold text-[#d4af37] hover:text-[#b8952d] transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] rounded-sm">
            Registrer deg her
          </Link>
        </div>

      </div>
    </div>
  );
}