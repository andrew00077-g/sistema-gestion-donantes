import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donantes from './pages/Donantes';
import FichaDonante from './pages/FichaDonante'; 
import InventarioStock from './pages/InventarioStock';     
import RegistrarUsuario from './pages/RegistrarUsuario'; 
import Alertas from './pages/Alertas'; 
import Sidebar from './components/Sidebar';

// GUARDiÁN DE SEGURIDAD INTERNO: Bloquea la ruta si no es administrador
const RutaProtegidaAdmin = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token || rol !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />; // Si intenta colarse un donante, lo mandamos al dashboard básico
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  if (isPublicPage) {
    return <div className="w-full min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden">
      <Sidebar />
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
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donantes" element={<Donantes />} />
          <Route path="/registrar-donante" element={<FichaDonante />} />
          <Route path="/inventario" element={<InventarioStock />} />
          
      
          <Route path="/alertas" element={<Alertas />} />
          
          {/* 2. NUEVA RUTA PROTEGIDA PARA REGISTRAR USUARIOS DEL SISTEMA */}
          <Route 
            path="/registrar" 
            element={
              <RutaProtegidaAdmin>
                <RegistrarUsuario />
              </RutaProtegidaAdmin>
            } 
          />

          {/* Comodín por si escriben una URL rota, los regresa al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;