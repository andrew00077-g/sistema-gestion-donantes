import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donantes from './pages/Donantes';
import Sidebar from './components/Sidebar';

// Componente para manejar cuándo mostrar el menú lateral
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Ocultamos el menú en Inicio y Login
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (isPublicPage) {
    return <div className="w-full min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden">
      {/* Menú Lateral */}
      <Sidebar />
      
      {/* Contenido Principal */}
      <div className="flex-grow flex flex-col bg-slate-50">
        <nav className="h-16 flex items-center px-6 bg-white border-b border-slate-200/60 text-slate-800 font-bold shadow-sm tracking-wide">
          BANCO DE SANGRE DE REFERENCIA DEPARTAMENTAL
        </nav>
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Privadas (Administrativas) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donantes" element={<Donantes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;