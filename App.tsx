import React, { useState } from 'react';
import { Page, User } from './types';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import SpinnerIcon from './components/icons/SpinnerIcon';

const App: React.FC = () => {
  const { user, loading, logout } = useFirebaseAuth();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    navigate(Page.Landing);
  };

  const handleLogout = () => {
    logout();
    navigate(Page.Landing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
            <SpinnerIcon className="w-12 h-12 text-sky-600" />
            <p className="mt-4 text-slate-700">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.Login:
      case Page.Register:
      case Page.ForgotPassword:
        return <AuthPage initialPage={currentPage} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
      
      case Page.Application:
        if (!user) {
          // Redirect to login if not authenticated
          return <AuthPage initialPage={Page.Login} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
        }
        return <ApplicationFormPage user={user} onLogout={handleLogout} navigateBack={() => navigate(Page.Landing)} navigate={navigate} />;
      
      case Page.ApplicationStatus:
        if (!user) {
           // Redirect to login if not authenticated
          return <AuthPage initialPage={Page.Login} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
        }
        return <ApplicationStatusPage user={user} onLogout={handleLogout} navigate={navigate} />;
      
      case Page.Landing:
      default:
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default App;
