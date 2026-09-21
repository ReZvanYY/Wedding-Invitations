import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GuestDB {
  id: number;
  full_name: string;
  is_attending: boolean;
}

interface ReplyGroup {
  response_id: number;
  comments: string | null;
  created_at: string;
  guests: GuestDB[];
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [replies, setReplies] = useState<ReplyGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Enforce admin-only access
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    // Only user ID 3 is allowed
    if (user.id !== 3) {
      navigate('/');
    }
  }, [token, user, navigate]);

  // Fetch all replies from the backend
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const apiUrl = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000';
        const apiResponse = await fetch(`${apiUrl}/api/guests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(errorData.message || 'API request failed');
        }

        const data = await apiResponse.json();
        setReplies(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Dashboard fetch error:", err.message);
          setError('Kunne ikke hente gjestelisten.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && user?.id === 3) fetchReplies();
  }, [token, user]);

  const toggleDropdown = (id: number) => setExpandedId(expandedId === id ? null : id);

  // Calculate the total number of guests marked as attending
  const totalAttending = replies.reduce((total, reply) => {
    return total + reply.guests.filter(g => g.is_attending).length;
  }, 0);

  if (!user) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start px-6 py-12 lg:py-24 z-10">
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md rounded-4 p-8 md:p-12 shadow-xl border border-purple-100 flex flex-col items-center">
        
        <h2 className="text-4xl font-['Great_Vibes'] text-[#42275a] mb-2 text-center">Gjesteliste</h2>
        <div className="flex items-center justify-center gap-4 text-sm font-bold tracking-[0.2rem] text-[#5e4b68] uppercase mb-10 w-full">
          <div className="w-8 h-px bg-[#d4af37]"></div>
          <span>Innsendte Svar</span>
          <div className="w-8 h-px bg-[#d4af37]"></div>
        </div>

        {/* Error message */}
        {error && <div className="w-full bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">{error}</div>}

        {isLoading ? (
          <p className="text-[#5e4b68] animate-pulse">Laster inn...</p>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center px-4 mb-2">
              <span className="text-sm font-bold uppercase text-[#5e4b68]">
                Totalt antall gjester som kommer: <span className="text-[#d4af37] text-lg ml-2">{totalAttending}</span>
              </span>
            </div>

            {/* Render the list of replies */}
            {replies.map((reply) => {
              // Extract the first guest's name to use as the main card header
              const mainGuest = reply.guests[0]?.full_name || "Ukjent innsender";
              const extraCount = reply.guests.length - 1;

              return (
                <div key={reply.response_id} className="w-full bg-white/80 border border-purple-200 rounded-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleDropdown(reply.response_id)}
                    className="w-full px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#4a3b52] text-lg">{mainGuest}</span>
                      {extraCount > 0 && (
                        <span className="bg-[#d4af37] text-white text-xs font-bold px-2 py-1 rounded-full">
                          + {extraCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(reply.created_at).toLocaleDateString('no-NO')}
                      </span>
                      <span className={`transform transition-transform text-[#d4af37] ${expandedId === reply.response_id ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                    </div>
                  </button>

                  <div className={`px-6 overflow-hidden transition-all bg-[#fdfbfd] ${expandedId === reply.response_id ? 'max-h-96 py-4 border-t border-purple-100' : 'max-h-0'}`}>
                    <div className="flex flex-col gap-4 text-sm text-[#5e4b68]">
                      
                      <div>
                        <p className="font-bold uppercase text-xs mb-2 text-[#d4af37]">Gjester i dette svaret</p>
                        <ul className="flex flex-col gap-1">
                          {reply.guests.map(g => (
                            <li key={g.id} className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${g.is_attending ? 'bg-green-500' : 'bg-red-400'}`}></span>
                              <strong className="text-[#4a3b52]">{g.full_name}</strong>
                              <span className="text-gray-500">- {g.is_attending ? 'Kommer' : 'Kan ikke komme'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {reply.comments && (
                        <div>
                          <p className="font-bold uppercase text-xs mb-1 text-[#d4af37]">Melding / Allergier</p>
                          <p className="p-3 bg-purple-50 rounded-md border border-purple-100 italic">"{reply.comments}"</p>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}