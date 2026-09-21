import NavBar from '../Components/NavBar';
import HomePage from '../Pages/HomePage';
import RegisterPage from '../Pages/RegisterPage';
import LoginPage from '../Pages/LoginPage';
import AdminDashboard from '../Pages/AdminDashboard';
import AttendacePage from '../Pages/AttendancePage';
import { AuthProvider } from '../Auth/AuthContext';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen font-['Montserrat'] text-[#4a3b52] flex flex-col overflow-x-hidden">
      <NavBar />
      <main className="w-full flex-1 flex flex-col items-center">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/attendance" element={<AttendacePage />} />
        </Routes>
      </main>
    </div>
    </AuthProvider>
  );
}

export default App;