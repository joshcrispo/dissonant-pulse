import React from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import About from './pages/About';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Shop from './pages/Shop';
import EventDetail from './pages/EventDetails';

import Navbar from './components/Navbar';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { UserProvider } from './context/UserContext';
import ShopItemDetail from './pages/ShopItemDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Main />
    </Router>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup'];

  return (
    <>
      <UserProvider>
        {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:title" element={<EventDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ShopItemDetail />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Admin />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </UserProvider>
    </>
  );
};

export default App;
