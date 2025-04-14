===========================================
       INNOVAFACTORY DASHBOARD
===========================================

DESCRIPCIÓN
-----------
InnovaFactory Dashboard es una aplicación web de monitoreo industrial en tiempo 
real que permite supervisar sensores de temperatura, vibración y humedad en 
diferentes zonas de una planta industrial. La aplicación incluye un dashboard 
principal y un asistente de IA para consultas en lenguaje natural.

CARACTERÍSTICAS PRINCIPALES
-------------------------
Dashboard Principal:
* Monitoreo en Tiempo Real: Visualización de datos de sensores actualizados 
  cada 5 segundos
* Alertas Activas: Sistema de notificación para valores fuera de rango
* Historial de Lecturas: Registro histórico de todas las mediciones
* Gráficos Dinámicos: Visualización de tendencias de temperatura
* Filtrado por Zonas: Organización de sensores por áreas específicas

Asistente IA:
* Consultas en Lenguaje Natural: Interacción mediante chat para consultar 
  estados y recomendaciones
* Análisis Predictivo: Sugerencias basadas en patrones de datos
* Recomendaciones de Mantenimiento: Guías específicas según las lecturas 
  de los sensores

TECNOLOGÍAS UTILIZADAS
---------------------
Frontend:
- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js para gráficos
- WebSocket para actualizaciones en tiempo real

Backend:
- Node.js
- Express.js
- WebSocket para comunicación bidireccional

ESTRUCTURA DEL PROYECTO
----------------------
innovafactory-dashboard/
|-- frontend/
|   |-- public/
|   |   |-- index.html
|   |   |-- newTab.html (Chat IA)
|   |   `-- assets/
|   `-- src/
|       |-- App.js
|       `-- App.css
|-- backend/
|   |-- controllers/
|   |   |-- sensors.js
|   |   `-- chatHandlers.js
|   |-- routes/
|   |   `-- sensors.js
|   `-- utils/
|       `-- simulator.js
`-- README.txt

RANGOS DE OPERACIÓN
------------------
Temperatura:
- Normal: 20°C - 75°C
- Alerta: 75°C - 85°C
- Crítico: > 85°C

Vibración:
- Normal: 0 - 0.7 m/s²
- Alerta: 0.7 - 0.9 m/s²
- Crítico: > 0.9 m/s²

Humedad:
- Normal: 35% - 60%
- Crítico Bajo: < 35%
- Crítico Alto: > 60%

INSTALACIÓN Y CONFIGURACIÓN
--------------------------
Prerrequisitos:
- Node.js (v14 o superior)
- npm (v6 o superior)

Pasos de Instalación:

1. Clonar el repositorio:
   git clone https://github.com/tu-usuario/innovafactory-dashboard.git
   cd innovafactory-dashboard

2. Instalar dependencias del backend:
   cd backend
   npm install

3. Instalar dependencias del frontend:
   cd ../frontend
   npm install

4. Configurar variables de entorno:
   cp .env.example .env
   (Editar el archivo .env con tus configuraciones)

5. Iniciar el servidor de desarrollo:
   # En la carpeta backend
   npm run dev

   # En la carpeta frontend
   npm start

USO DEL SISTEMA
--------------
Dashboard Principal:
1. Acceder a http://localhost:3000
2. Seleccionar la zona deseada en el selector superior
3. Monitorear las lecturas en tiempo real
4. Consultar el historial completo mediante el botón "Ver historial completo"

Asistente IA:
1. Hacer clic en el botón "Análisis IA" en el menú de usuario
2. Realizar consultas en lenguaje natural, por ejemplo:
   - "¿Cuáles son los rangos normales de vibración?"
   - "¿Hay alertas activas?"
   - "¿Qué hacer si la temperatura supera los 80°C?"

MANTENIMIENTO Y MONITOREO
------------------------
Alertas:
- Las alertas se muestran en tiempo real en el panel principal
- Se categorizan por nivel de severidad (Normal, Alerta, Crítico)
- Incluyen recomendaciones específicas para cada situación

Acciones Recomendadas:

1. Temperatura Alta:
   - Verificar sistema de refrigeración
   - Aumentar ventilación
   - Revisar carga de trabajo

2. Vibración Excesiva:
   - Inspeccionar rodamientos
   - Verificar alineación
   - Revisar estado de la maquinaria

3. Humedad Fuera de Rango:
   - Ajustar sistema HVAC
   - Verificar sellos
   - Revisar ventilación

CONTRIBUCIÓN
-----------
Si deseas contribuir al proyecto:
1. Hacer fork del repositorio
2. Crear una rama para tu feature (git checkout -b feature/AmazingFeature)
3. Commit de tus cambios (git commit -m 'Add some AmazingFeature')
4. Push a la rama (git push origin feature/AmazingFeature)
5. Abrir un Pull Request



LICENCIA
--------
Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE.txt para más 
detalles.

AUTORES
-------
- Mariola Martínez Santos

