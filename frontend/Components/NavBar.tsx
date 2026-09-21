import { useAuth } from '../Auth/AuthContext';
import { Link } from 'react-router-dom';

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav 
      className="w-full px-6 py-4 flex items-center justify-between z-50 bg-[#f6e6ff] backdrop-blur-md border-b border-purple-100/50"
      aria-label="Hovednavigasjon"
    >
      <div className="flex items-center gap-2">
        <Link to="/" className="text-4xl font-['Great_Vibes'] text-[#42275a]" aria-label="Hjem">
          M & T
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {isAuthenticated && user ? (
          // IF LOGGED IN: Show user name and Logout button
          <>
            <span className="text-[0.875rem] font-bold text-[#5e4b68] sm:block">
              Hei, {user.first_name}
            </span>
            <button 
              onClick={logout}
              className="text-[0.75rem] sm:text-[0.875rem] font-['Montserrat'] font-bold tracking-[0.15rem] uppercase text-[#5e4b68] transition-all duration-300 hover:text-[#d4af37]"
            >
              Logg ut
            </button>
          </>
        ) : (
          // IF LOGGED OUT: Show Sign In and Register buttons
          <>
            <Link 
              to="/login"
              className="text-[0.75rem] sm:text-[0.875rem] font-['Montserrat'] font-bold tracking-[0.15rem] uppercase text-[#5e4b68] transition-all duration-300 hover:text-[#d4af37]"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="bg-[#42275a] text-white text-[0.75rem] sm:text-[0.875rem] font-bold tracking-[0.15rem] uppercase py-2.5 px-6 rounded-full transition-all duration-300 shadow-md hover:bg-[#2d1b3e]"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}