import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GuestInput {
  full_name: string;
  is_attending: boolean;
}

export default function AttendancePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Initialize form state
  const [guests, setGuests] = useState<GuestInput[]>([
    { full_name: user ? `${user.first_name} ${user.last_name}` : '', is_attending: true }
  ]);
  const [comments, setComments] = useState('');
  
  // UI States
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingOldData, setIsFetchingOldData] = useState(true);

  // Require authentication and fetch existing data if available
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    const fetchExistingReply = async () => {
      try {
        const apiUrl = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/my-reply`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // If the user has already submitted a form, pre-fill it!
          if (data) {
            setGuests(data.guests);
            setComments(data.comments || '');
            setIsEditing(true);
          }
        }
      } catch (error) {
        console.error("Error fetching existing reply, user may not have replied yet:", error);
      } finally {
        setIsFetchingOldData(false);
      }
    };

    fetchExistingReply();
  }, [token, user, navigate]);

  const updateGuestName = (index: number, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index].full_name = value;
    setGuests(updatedGuests);
  };

  const updateGuestAttendance = (index: number, value: boolean) => {
    const updatedGuests = [...guests];
    updatedGuests[index].is_attending = value;
    setGuests(updatedGuests);
  };

  const addGuest = () => setGuests([...guests, { full_name: '', is_attending: true }]);
  
  const removeGuest = (index: number) => setGuests(guests.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    // Remove empty guest entries before submitting
    const validGuests = guests.filter(g => g.full_name.trim() !== '');

    if (validGuests.length === 0) {
      setStatusMessage({ text: 'Du må skrive inn minst ett navn.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000';
      
      const apiResponse = await fetch(`${apiUrl}/api/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Send the payload exactly as the server expects it
        body: JSON.stringify({ guests: validGuests, comments })
      });

      if (!apiResponse.ok) throw new Error('API Request Failed');
      
      setStatusMessage({ 
        text: isEditing ? 'Svaret ditt er oppdatert!' : 'Svaret ditt er sendt inn! Tusen takk.', 
        type: 'success' 
      });
      setIsEditing(true); // Switch to editing mode if it was their first submission
    } catch (err) {
      console.error('Form submission error:', err);
      setStatusMessage({ text: 'Kunne ikke lagre svaret. Prøv igjen.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start px-6 py-12 lg:py-24 z-10">
      <div className="w-full max-w-xl bg-white/60 backdrop-blur-md rounded-4 p-8 md:p-12 shadow-xl border border-purple-100">
        
        {isFetchingOldData ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-[#5e4b68] font-bold uppercase tracking-widest animate-pulse">Laster inn skjema...</p>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-['Great_Vibes'] text-[#42275a] mb-2 text-center">
              {isEditing ? 'Endre ditt svar' : 'Svar på invitasjon'}
            </h2>
            <p className="text-center text-sm text-[#5e4b68] mb-8">
              {isEditing ? 'Du har allerede svart, men du kan endre detaljene nedenfor hvis du trenger det.' : 'Fyll ut skjemaet for å registrere ankomst.'}
            </p>

            {statusMessage && (
              <div className={`w-full p-4 rounded-lg mb-6 border text-center font-bold ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                  <label className="text-sm font-bold tracking-[0.1rem] uppercase text-[#5e4b68]">Gjester</label>
                  <button type="button" onClick={addGuest} className="text-sm font-bold text-[#d4af37] hover:text-[#b8952d]">
                    + Legg til person
                  </button>
                </div>

                {guests.map((guest, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white/40 p-3 rounded-lg border border-purple-100">
                    <input 
                      type="text" 
                      required 
                      value={guest.full_name} 
                      onChange={(e) => updateGuestName(index, e.target.value)}
                      className="w-full bg-white/80 border border-purple-200 rounded-lg px-4 py-2 text-[#4a3b52] focus:ring-2 focus:ring-[#d4af37] outline-none"
                      placeholder="Fullt navn"
                    />
                    
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <label className="flex items-center gap-1 text-sm text-[#4a3b52] cursor-pointer">
                        <input 
                          type="radio" 
                          checked={guest.is_attending} 
                          onChange={() => updateGuestAttendance(index, true)} 
                          className="accent-[#d4af37]" 
                        />
                        Kommer
                      </label>
                      <label className="flex items-center gap-1 text-sm text-[#4a3b52] cursor-pointer">
                        <input 
                          type="radio" 
                          checked={!guest.is_attending} 
                          onChange={() => updateGuestAttendance(index, false)} 
                          className="accent-[#d4af37]" 
                        />
                        Kan ikke
                      </label>
                    </div>

                    {/* Only show the remove button if there is more than 1 guest in the list */}
                    {guests.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeGuest(index)} 
                        className="text-red-400 hover:text-red-600 font-bold px-2"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mb-4 mt-2">
                <label className="text-sm font-bold tracking-[0.1rem] uppercase text-[#5e4b68]">
                  Melding / Allergier
                </label>
                <textarea 
                  rows={3} 
                  value={comments} 
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white/80 border border-purple-200 rounded-lg px-4 py-3 text-[#4a3b52] focus:ring-2 focus:ring-[#d4af37] outline-none resize-none"
                  placeholder="Skriv inn eventuelle allergier eller beskjeder her..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-[#42275a] hover:bg-[#2d1b3e] text-white font-bold tracking-[0.15rem] uppercase py-4 rounded-full shadow-md transition-all"
              >
                {isLoading ? (isEditing ? 'Oppdaterer...' : 'Sender...') : (isEditing ? 'Oppdater Svar' : 'Send Inn Svar')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}