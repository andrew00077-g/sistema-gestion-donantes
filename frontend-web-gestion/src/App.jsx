import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Activity, Users, Droplets, Bell } from 'lucide-react';

function App() {
  // Estilos basados en tu paleta
  const styles = {
    navbar: { backgroundColor: '#C91C1C', color: 'white' },
    cardHeader: { backgroundColor: '#F8FAF9', borderBottom: '1px solid #eee' },
    sidebar: { backgroundColor: '#1F2937', minHeight: '100vh', color: 'white' }
  };

  return (
    <div className="d-flex">
      {/* Sidebar - Capa de Navegación */}
      <div className="p-3" style={styles.sidebar}>
        <h4 className="text-center mb-4">Gestión Sangre</h4>
        <ul className="nav flex-column">
          <li className="nav-item mb-2"><a href="#" className="nav-link text-white"><Activity size={20}/> Dashboard</a></li>
          <li className="nav-item mb-2"><a href="#" className="nav-link text-white"><Users size={20}/> Donantes</a></li>
          <li className="nav-item mb-2"><a href="#" className="nav-link text-white"><Droplets size={20}/> Inventario</a></li>
          <li className="nav-item mb-2"><a href="#" className="nav-link text-white"><Bell size={20}/> Alertas</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        <nav className="navbar px-4 shadow-sm" style={styles.navbar}>
          <span className="navbar-brand mb-0 h1 text-white">Panel de Administración</span>
        </nav>

        <div className="p-4">
          <div className="row">
            {/* Tarjeta de Donantes Activos */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body text-center">
                  <h6 className="text-muted">Donantes Activos</h6>
                  <h2 style={{color: '#C91C1C'}}>1,240</h2>
                </div>
              </div>
            </div>
            {/* Tarjeta de Alertas Hoy */}
            <div className="col-md-4">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body text-center">
                  <h6 className="text-muted">Alertas enviadas hoy</h6>
                  <h2 className="text-primary">3</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Área de Alerta Directa */}
          <div className="card shadow-sm border-0">
            <div className="card-header" style={styles.cardHeader}>
              <h5 className="mb-0">Emitir Alerta de Emergencia</h5>
            </div>
            <div className="card-body">
              <textarea className="form-control mb-3" rows="3" placeholder="Escriba el mensaje de emergencia..."></textarea>
              <button className="btn text-white w-100" style={{backgroundColor: '#C91C1C'}}>
                NOTIFICAR A DONANTES COMPATIBLES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;