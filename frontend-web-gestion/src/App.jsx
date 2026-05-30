import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Donantes from './pages/Donantes';
import FichaDonante from './pages/FichaDonante'; 
import Citas from './pages/Citas'; 
import InventarioStock from './pages/InventarioStock';     
import RegistrarUsuario from './pages/RegistrarUsuario'; 
import Alertas from './pages/Alertas'; 
import Sidebar from './components/Sidebar';
import MenuPerfil from './components/MenuPerfil';
import Donaciones from './pages/Donaciones';
import UrgenciaPanel from './components/UrgenciaPanel';

// GUARDiÁN DE SEGURIDAD INTERNO: Bloquea la ruta si no es administrador
const RutaProtegidaAdmin = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token || rol !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />; 
  }
  return children;
};

// COMPONENTE LAYOUT UNIFICADO
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicPage = location.pathname === '/' || location.pathname === '/login';

  // Calculamos el usuario dinámicamente durante el renderizado 
  let usuarioActual = null;
  
  if (localStorage.getItem('token')) {
    usuarioActual = {
      nombre: localStorage.getItem('nombre') || 'Dr. Andrew',
      rol: localStorage.getItem('rol') || 'ADMIN',
      email: localStorage.getItem('email') || 'admin@banco.com',
      ci: localStorage.getItem('ci') || '0000000',
      telefono: localStorage.getItem('telefono') || '70000000'
    };
  }

  // Función para borrar sesión y mandar al usuario al Login
  const alCerrarSesion = () => {
    localStorage.clear(); // Limpia token, roles y datos
    navigate('/login');
  };

  if (isPublicPage) {
    return <div className="w-full min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col bg-slate-50">
        
        {/* Barra superior inteligente flex */}
        <nav className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200/60 text-slate-800 font-bold shadow-sm tracking-wide">
          <span>BANCO DE SANGRE DE REFERENCIA DEPARTAMENTAL</span>
          
          {/* Añadimos el menú interactivo a la derecha */}
          <MenuPerfil 
            usuarioActual={usuarioActual} 
            alCerrarSesion={alCerrarSesion} 
          />
        </nav>

        <div className="grow">
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
          <Route path="/citas" element={<Citas />} /> 
          <Route path="/inventario" element={<InventarioStock />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/donaciones" element={<Donaciones />} />
          
          {/* ⚡ NUEVA RUTA: PANEL DE EMERGENCIAS CON IA */}
          <Route path="/urgencia-ia" element={<UrgenciaPanel />} />
          
          <Route 
            path="/registrar" 
            element = {
              <RutaProtegidaAdmin>
                <RegistrarUsuario />
              </RutaProtegidaAdmin>
            } 
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;