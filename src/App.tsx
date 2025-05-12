import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Daw from './pages/Daw';
import NullTest from './pages/NullTest';
import Chat from './pages/Chat';
import Loops from './pages/Loops';
import Profile from './pages/Profile';
import RequireAuth from './hooks/RequireAuth';
import LayoutWrapper from './components/LayoutWrapper';

function App() {
  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/loops" element={<RequireAuth><Loops /></RequireAuth>} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/daw" element={<RequireAuth><Daw /></RequireAuth>} />
         <Route path="/NullTest" element={<RequireAuth><NullTest /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
      </Routes>
    </LayoutWrapper>
  );
}

export default App;
