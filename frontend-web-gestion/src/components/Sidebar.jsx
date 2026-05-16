import React from 'react';
import { LayoutDashboard, Users, Droplets, Bell, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', active: true },
    { icon: <Users size={20}/>, label: 'Donantes', active: false },
    { icon: <Droplets size={20}/>, label: 'Inventario Sangre', active: false },
    { icon: <Bell size={20}/>, label: 'Alertas', active: false },
  ];

  return (
    <div className="d-flex flex-column p-3 text-white" style={{ width: '260px', backgroundColor: '#1F2937', minHeight: '100vh' }}>
      <div className="text-center mb-4">
        <h5 className="fw-bold">SISTEMA GESTIÓN</h5>
        <hr />
      </div>
      
      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item, index) => (
          <li className="nav-item mb-2" key={index}>
            <a href="#" className={`nav-link text-white d-flex align-items-center gap-3 ${item.active ? 'bg-danger' : ''}`}>
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      
      <hr />
      <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
        <LogOut size={20} />
        <span>Cerrar Sesión</span>
      </div>
    </div>
  );
};

export default Sidebar;