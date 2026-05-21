import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Droplets, Bell, LogOut, UserPlus, ShieldAlert } from 'lucide-react'; // Importamos ShieldAlert para el Admin

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperamos el rol del usuario que inició sesión
  const userRol = localStorage.getItem('rol');

  // Mapeamos los ítems base con sus respectivas rutas de React Router
  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/dashboard' },
    { icon: <UserPlus size={20}/>, label: 'Registrar Donante', path: '/registrar-donante' },
    { icon: <Users size={20}/>, label: 'Donantes', path: '/donantes' },
    { icon: <Droplets size={20}/>, label: 'Inventario Sangre', path: '/inventario' },
    { icon: <Bell size={20}/>, label: 'Alertas', path: '/alertas' },
  ];

  // TRUCO DE SEGURIDAD EN VISTA: Si es ADMIN, le inyectamos la opción de Registrar Usuarios del Sistema
  if (userRol === 'ADMIN') {
    menuItems.push({ 
      
      icon: <ShieldAlert size={20} />, 
      label: 'Registrar Usuario (Admin)', 
      path: '/registrar' // Apunta exactamente a la ruta que creamos en tu App.jsx
    });
  }

  // Función mejorada para cerrar sesión limpiando las credenciales del navegador
  const handleLogout = () => {
    localStorage.clear(); // Borra el token, rol y correo para que no se queden guardados
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col p-4 border-r border-slate-800 shrink-0 select-none min-h-screen">
      
      {/* Logotipo o Cabecera */}
      <div className="pb-6 mb-4 border-b border-slate-800 text-center">
        <h5 className="text-sm font-black tracking-widest text-red-500 uppercase">BANCO DE SANGRE</h5>
        <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">PANEL DE CONTROL</p>
      </div>
      
      {/* Lista del Menú de Navegación Dinámica */}
      <ul className="space-y-1 flex-grow">
        {menuItems.map((item, index) => {
          // Evalúa dinámicamente si la URL del navegador coincide con la ruta del botón
          const isActive = location.pathname === item.path;
          
          return (
            <li key={index}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all outline-none ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      
      {/* Botón de Salida del Sistema */}
      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-all outline-none"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;