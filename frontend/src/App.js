import React, { useEffect, useState } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import logo from './logo.png';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedZone, setSelectedZone] = useState('Almacén A');
  const [tempHistory, setTempHistory] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [currentSensorIndex, setCurrentSensorIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [fullHistory, setFullHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-section')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('http://localhost:3000/api/sensors');
      const data = await res.json();
      setSensors(data);

      const temp = data.find(s => s.sensor_id === 'Temp_01');
      if (temp) {
        setTempHistory(prev => {
          const updated = [...prev, { value: temp.value, time: new Date(temp.timestamp).toLocaleTimeString() }];
          return updated.slice(-60); // Mantener última hora
        });
      }
    };

    const fetchAlerts = async () => {
      const res = await fetch('http://localhost:3000/api/alerts');
      const data = await res.json();
      setAlerts(data);
    };

    const updateDisplayedRows = async () => {
      const res = await fetch('http://localhost:3000/api/sensors');
      const data = await res.json();
      const recent = data.filter(s =>
        ['Temp_01', 'Vib_01', 'Hum_01'].includes(s.sensor_id)
      ).map(s => ({
        id: s.sensor_id,
        value: s.value,
        unit: s.unit,
        time: new Date(s.timestamp).toLocaleTimeString()
      }));
      setDisplayedRows(recent.slice(0, 3));
    };

    // Auto-scroll para los sensores
    const scrollInterval = setInterval(() => {
      setCurrentSensorIndex(prev => (prev + 1) % Math.max(sensors.length - 3, 1));
    }, 3000);

    fetchData();
    fetchAlerts();
    updateDisplayedRows();
    const sensorInterval = setInterval(fetchData, 5000);
    const alertInterval = setInterval(fetchAlerts, 5000);
    const historyInterval = setInterval(updateDisplayedRows, 30000);

    return () => {
      clearInterval(sensorInterval);
      clearInterval(alertInterval);
      clearInterval(historyInterval);
      clearInterval(scrollInterval);
    };
  }, [sensors.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (showModal) {
        handleShowFullHistory();
      }
    }, 120000); // Actualizar cada dos minutos

    return () => clearInterval(interval);
  }, [showModal]);

  const handleShowFullHistory = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:3000/api/history?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await res.json();
      setFullHistory(data.items);
      setTotalItems(data.total);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:3000/api/history?page=${newPage}&limit=${itemsPerPage}`);
      const data = await res.json();
      setFullHistory(data.items);
    } catch (error) {
      console.error('Error al cargar la página:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showModal) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  const tempChartData = {
    labels: tempHistory.map(d => d.time),
    datasets: [{
      label: 'Temp_01',
      data: tempHistory.map(d => Number(d.value).toFixed(1)),
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: false } }
  };

  // Filtrar sensores por zona y mostrar solo 4 a la vez
  const filteredSensors = sensors.filter(s => s.zone === selectedZone);
  const visibleSensors = filteredSensors.slice(currentSensorIndex, currentSensorIndex + 4);

  const formatNumber = (value) => {
    return Number(value).toLocaleString('es-ES', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
  };

  return (
    <div className="App">
      <header>
        <div className="logo-section">
          <img src={logo} alt="logo" className="logo" />
          <h1>InnovaFactory Dashboard</h1>
        </div>
        <div className="user-section">
          <div className="user-button" onClick={() => setShowUserMenu(!showUserMenu)}>
            👤 Usuario
          </div>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <div>
                    <div className="user-name">Mariola Martínez</div>
                    <div className="user-role">Técnico de Mantenimiento</div>
                  </div>
                </div>
              </div>
              <div className="user-menu-items">
                <a href="#"><i className="menu-icon">👤</i> Mi Perfil</a>
                <a href="#"><i className="menu-icon">📋</i> Mis Tareas</a>
                <a href="#"><i className="menu-icon">🔧</i> Órdenes de Trabajo</a>
                <a href="#"><i className="menu-icon">📅</i> Calendario</a>
                <a href="#" onClick={() => window.open('/newTab.html', '_blank')}><i className="menu-icon">📊</i> Análisis IA</a>
                <a href="#"><i className="menu-icon">⚙️</i> Configuración</a>
                <div className="menu-divider"></div>
                <a href="#" className="logout"><i className="menu-icon">🚪</i> Cerrar Sesión</a>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="sensor-carrusel">
        <div className="scrolling-strip">
          {visibleSensors.map((s, i) => (
            <div className={`sensor-card ${s.status === 'ALERT' ? 'alert' : ''}`} key={i}>
              <p>{s.sensor_id}</p>
              <h2>{formatNumber(s.value)} {s.unit === 'g' ? 'm/s²' : s.unit}</h2>
              <span className={`status ${s.status.toLowerCase()}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-body">
        <div className="left-section">
          <div className="alerts-section">
            <h2>🚨 Alertas activas</h2>
            <ul>
              {alerts.slice(0, 4).map((alert, i) => (
                <li key={i}>
                  🔴 {alert.sensor_id} en {alert.zone} → {formatNumber(alert.value)}{alert.unit}
                </li>
              ))}
            </ul>
          </div>

          <div className="history-section">
            <h2>🕓 Historial de lecturas
              <button className="history-button" onClick={handleShowFullHistory}>Ver historial completo</button>
            </h2>
            <table>
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Valor</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.id}</td>
                    <td>{formatNumber(row.value)} {row.unit}</td>
                    <td>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-section">
          <div className="zone-selector">
            <label>Zona:</label>
            <select onChange={(e) => setSelectedZone(e.target.value)} value={selectedZone}>
              <option>Almacén A</option>
              <option>Zona B</option>
              <option>Zona C</option>
              <option>Motor A</option>
              <option>Motor B</option>
              <option>Horno A</option>
              <option>Zona Técnica</option>
            </select>
          </div>

          <div className="chart-section">
            <h2>📈 Evolución de temperatura (última hora)</h2>
            <Line data={tempChartData} options={options} />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Historial Completo</h2>
            <div className="modal-table-container">
              {isLoading ? (
                <div className="loading">Cargando datos...</div>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Sensor</th>
                        <th>Valor</th>
                        <th>Unidad</th>
                        <th>Zona</th>
                        <th>Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullHistory.map((row, i) => (
                        <tr key={i}>
                          <td>{row.sensor}</td>
                          <td>{formatNumber(row.valor)}</td>
                          <td>{row.unidad}</td>
                          <td>{row.zona}</td>
                          <td>{row.hora}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      Anterior
                    </button>
                    <span>Página {currentPage} de {Math.ceil(totalItems / itemsPerPage)}</span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalItems / itemsPerPage) || isLoading}
                    >
                      Siguiente
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;