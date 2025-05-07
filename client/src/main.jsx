import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { persistor, store } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SocketProvider from './components/SocketProvider.jsx';
import { useParams } from 'react-router-dom';

const SocketProviderWrapper = ({ children }) => {
  const { listingId } = useParams();  // Get listingId from URL

  // Only pass listingId to SocketProvider when needed (e.g., on chat page)
  if (listingId) {
    return (
      <SocketProvider listingId={listingId}>
        {children}
      </SocketProvider>
    );
  }
  
  // Else, render children without passing listingId
  return <SocketProvider>{children}</SocketProvider>;
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    
        <SocketProviderWrapper>
          <App />
        </SocketProviderWrapper>
      
    </PersistGate>
  </Provider>
);
