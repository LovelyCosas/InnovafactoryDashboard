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
-React.js
-Chart.js y react-chartjs-2 para gráficos
-Fetch API para comunicación con el backend

Backend:
- Node.js
- Express.js
- API RESTful

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
   npm install chart.js react-chartjs-2   <---- para la visualización de los gráficos
4. Configurar variables de entorno:
   cp .env.example .env
   (Editar el archivo .env con tus configuraciones)<--- no es necesario si solo quieres probar con las que ya están

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

Preguntas recomendadas a la "IA":

📊 Estado y Valores Actuales
¿Cuál es el estado actual de los sensores?
¿Qué valores tiene Vib_03?
¿Cómo está la temperatura ahora?
¿Cuál es el nivel de humedad actual?
¿Hay alguna alerta activa?
🔍 Análisis de Normalidad
¿Es normal que Vib_02 tenga un valor de 0.85g?
¿Está bien la temperatura a 75°C?
¿Es correcto este nivel de humedad?
¿Son normales estos valores?
⚠️ Alertas y Problemas
¿Hay algún problema con Vib_03?
¿Qué hacer si la vibración supera 0.7g?
¿Qué hacer si la temperatura está alta?
¿Qué hacer si la humedad está baja?
📈 Rangos Normales
¿Cuáles son los rangos normales de vibración?
¿Qué valores de temperatura son aceptables?
¿Cuál es el rango ideal de humedad?
🛠️ Mantenimiento
¿Cuándo hacer mantenimiento preventivo?
¿Qué revisar en Vib_03 si marca 1.0g?
¿Cómo revisar la humedad en zona B?
¿Qué hacer si hay sensores fuera de rango?
🛡️ Prevención
¿Cómo prevenir problemas de temperatura?
¿Qué medidas preventivas tomar con la vibración?
¿Cómo evitar problemas de humedad?
¿Cómo prevenir fallos en los sensores?
⚙️ Problemas Específicos
¿Qué impacto tienen las vibraciones en los rodamientos?
¿Qué problemas causa la temperatura a 90°C?
¿Qué hacer si un sensor está mal?
¿Qué efectos tiene la humedad alta en los equipos?


AUTORES
-------
- Mariola Martínez Santos

