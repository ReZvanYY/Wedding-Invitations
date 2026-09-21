// This is the HomePage component that serves as the landing page for the wedding invitation website. It displays the main hero section with the couple's names, date, location, and a call-to-action button that changes based on the user's authentication status and whether they have replied to the invitation. It also includes a section with information cards about the ceremony, dinner & party, location, wishlist, accommodation, and toastmaster.
import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// The HomePage component renders the main landing page for the wedding invitation website. It displays the couple's names, date, location, and a call-to-action button that changes based on the user's authentication status and whether they have replied to the invitation. It also includes a section with information cards about the ceremony, dinner & party, location, wishlist, accommodation, and toastmaster.
export default function HomePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [hasReplied, setHasReplied] = useState(false);

  // Check if the user is authenticated and has replied to the invitation. If the user is authenticated and not the admin (user ID 3), fetch their reply status from the backend.
  useEffect(() => {
    // Check to ensure the user is authenticated and not the admin (user ID 3) before fetching their reply status.
    if (user && user.id !== 3 && token) {
      const checkReplyStatus = async () => {
        try {
          const apiUrl = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiUrl}/api/my-reply`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            if (data) {
              setHasReplied(true); // User has replied - set the state accordingly
            }
          }
        } catch (error) {
          console.error("Could not fetch reply status:", error);
        }
      };

      checkReplyStatus();
    }
  }, [user, token]);

  return (
    <main className="min-h-screen font-['Montserrat'] text-[#4a3b52] overflow-hidden flex flex-col items-center w-full">
      {/* HERO SECTION */}
      <section className="w-full max-w-[120rem] px-6 pt-16 lg:pt-32 pb-24 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
        
        {/* Left side: Text and Call to Action */}
        <div className="w-full lg:w-1/2 flex flex-col items-center text-center order-2 lg:order-1">
          
          {/* Top decorative elements */}
          <div className="flex items-center justify-center gap-4 text-3 font-bold tracking-[0.2rem] text-[#5e4b68] uppercase mb-6 w-full">
            <div className="w-12 h-px bg-[#ffd754]"></div>
            <span className="whitespace-nowrap">Vi skal gifte oss</span>
            <svg className="w-4 h-4 text-[#ffd754] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <div className="w-12 h-px bg-[#ffd754]"></div>
          </div>
          
          {/* Names */}
          <div>
            <h1 className="text-[5rem] font-['Great_Vibes'] text-[#42275a] mb-2">Martine</h1>
            <span className="text-[3rem] font-['Playfair_Display'] italic text-[#ffd754] -my-6 z-10">&</span>
            <h1 className="text-[5rem] font-['Great_Vibes'] text-[#42275a] mt-3 mb-2">Thomas</h1>
          </div>

          {/* Middle golden line */}
          <div className="flex items-center justify-center w-32 mb-8">
            <div className="h-px grow bg-[#ffd754]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#ffd754] shrink-0 mx-1"></div>
            <div className="h-px grow bg-[#ffd754]"></div>
          </div>

          {/* Date and Location Details */}
          <div className="flex flex-col gap-4 mb-12 text-[1.25rem] md:text-4 font-bold tracking-[0.15rem] text-[#5e4b68]">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-10 h-10 text-[#ffd754]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              15. MAI 2027
            </div>
            <div className="flex items-center justify-center gap-3">
              <svg className="w-10 h-10 text-[#ffd754]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Vestsideveien 1344, 3536 Noresund.
            </div>
          </div>

          {/* Conditional Action Buttons Based on Auth, Role, and Reply Status */}
          {!user ? (
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#42275a] hover:bg-[#2d1b3e] text-white text-3 font-bold tracking-[0.15rem] uppercase py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center gap-1 group"
            >
              LOGG INN FOR Å SVARE
              <svg className="w-4 h-4 mt-1 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          ) : user.id === 3 ? (
            <button 
              onClick={() => navigate('/admindashboard')}
              className="bg-[#42275a] hover:bg-[#2d1b3e] text-white text-3 font-bold tracking-[0.15rem] uppercase py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center gap-1 group"
            >
              ADMIN DASHBOARD
              <svg className="w-4 h-4 mt-1 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          ) : hasReplied ? (
            <button 
              onClick={() => navigate('/attendance')}
              className="bg-[#6b507b] hover:bg-[#5e4b68] text-white text-3 font-bold tracking-[0.15rem] uppercase py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center gap-1 group"
            >
              ENDRE DITT SVAR
              <svg className="w-4 h-4 mt-1 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          ) : (
            <button 
              onClick={() => navigate('/attendance')}
              className="bg-[#d4af37] hover:bg-[#c4a235] text-white text-3 font-bold tracking-[0.15rem] uppercase py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col items-center gap-1 group"
            >
              SVAR PÅ INVITASJON
              <svg className="w-4 h-4 mt-1 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Right side: Image and Decorative Border */}
        <div className="w-full lg:w-1/2 flex justify-center order-1 lg:order-2">
          <div className="grid grid-cols-1 grid-rows-1 place-items-center w-full min-w-[16rem] max-w-[20rem] sm:max-w-[24rem] lg:max-w-md xl:max-w-136 aspect-2/3">
            <div className="col-start-1 row-start-1 w-[110%] h-[105%] border-10 border-[#ffd75470] rounded-t-full rounded-b-4 opacity-60 flex justify-center items-start z-0">
              <div className="bg-[#fdfbfd] px-2 text-[#ffd754] -mt-5 flex items-center justify-center">
                <svg className="w-10 h-10 flex -mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
            </div>

            <div className="col-start-1 row-start-1 w-full h-full rounded-t-full rounded-b-4 overflow-hidden bg-[#ecdcf5] shadow-xl flex z-10">
              <img src="https://i.imghippo.com/files/eDpk3384xHw.png" alt="Thomas og Martine" className="w-full h-full object-cover object-center" />
            </div>

            <div className="col-start-1 row-start-1 w-full h-full flex items-end justify-end pointer-events-none z-30 overflow-visible">
              <img src="https://i.imghippo.com/files/XAP8766kj.png" alt="" className="opacity-95 drop-shadow-2xl object-contain origin-center sm:w-full md:w-full lg:w-[60%] xl:w-full translate-x-[25%] translate-y-[25%] -rotate-12 transform-gpu" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Information Cards Section */}
      <section className="w-full max-w-[120rem] px-6 pb-24 z-30">
        
        {/* Changed to a grid layout to gracefully handle 6 cards */}
        <div className="bg-[#f6e6ff] backdrop-blur-md rounded-4 p-6 md:p-10 shadow-sm border border-purple-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
          
          {/* Ceremony Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12a4 4 0 100-8 4 4 0 000 8zM16 12a4 4 0 100-8 4 4 0 000 8z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 10h12"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Seremoni</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">
              Vielsen er kl. <strong>13.00</strong> i Hval kirke på Hallingby.<br />
              Vielsen vil foreviges av fotograf Silje Karlsrud Nyhus. Vi ber derfor om at dere deler øyeblikket sammen med oss.
            </p>
          </div>

          {/* Dinner & Party Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM3 16.811c0 .864.933 1.405 1.683.977l7.108-4.062a1.125 1.125 0 000-1.953L4.683 7.71A1.125 1.125 0 003 8.688v8.123z"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Middag & Fest</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">Middagen serveres fra kl. 17.00.</p>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">Det er muligheter for å komme rett fra vielsen til festlokalet.</p>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">Kleskode: Pent, sommerlig, fargerikt. Vi ber om forståelse for at bryllupsfesten er barnefri.</p>
          </div>

          {/* Location Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Sted</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">Bryllupsfesten holdes på Nordre Bjøre selskapslokaler på Noresund</p>
            <p className="font-bold text-[1.25rem] mt-2">Adresse:</p>
            <p className="font-bold text-[1.25rem]">Vestsideveien 1344, 3536 Noresund.</p>
          </div>

          {/* Wishlist Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Ønskeliste</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">
              Vi ønsker oss pengegaver som skal gå til bryllupsreise. I tillegg har vi opprettet en ønskeliste på Kitchn:
            </p>
            <a href="https://www.kitchn.no/onskeliste/261012/" target="_blank" rel="noopener noreferrer" className="text-[#c4a235] font-bold text-[1.25rem] hover:underline mt-2">
              Se Kitchn Ønskeliste her
            </a>
          </div>

          {/* Accommodation (Overnatting) Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Overnatting</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">
              Det er holdt av rom på Sole Gjestegård på Noresund. De som ønsker rom tar selv kontakt med dem for å reservere (fortell at du er gjest i bryllupet til Bjørklund/Eriksen).
            </p>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed mt-4">
              <strong>Pris per døgn:</strong><br />
              Dobbeltrom/Twinrom (2 voksne): kr 1680,-<br />
              Enkeltrom: kr 1190,-<br />
              <em>(Begge inkl. frokost)</em>
            </p>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed mt-4">
              Ved spørsmål utover dette, ta kontakt med Kjell Arne Bjørklund.
            </p>
          </div>

          {/* Toastmaster Card */}
          <div className="flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-[#42275a] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
            <h3 className="text-xl font-bold tracking-[0.15rem] uppercase mb-2">Toastmaster</h3>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed">
              Kveldens toastmaster er <strong>Marit Bråthen</strong>. Det er hun som holder styr på taler og andre innslag i løpet av kvelden.
            </p>
            <p className="text-[1.25rem] text-gray-600 leading-relaxed mt-4">
              Hun kan kontaktes på telefon:<br />
              <strong className="text-xl text-[#4a3b52]">950 06 756</strong>
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}