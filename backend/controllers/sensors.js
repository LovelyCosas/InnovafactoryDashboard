// @charset "UTF-8"
// Datos simulados iniciales
let readings = [
  // Almacén A - 4 sensores (2 temp, 1 vib, 1 hum)
  {
    sensor_id: 'Temp_01',
    value: 78.6,
    unit: '°C',
    status: 'OK',
    zone: 'Almacén A',
    timestamp: new Date()
  },
  {
    sensor_id: 'Temp_02',  // Sensor que siempre estará en alerta
    value: 84.3,
    unit: '°C',
    status: 'ALERT',
    zone: 'Almacén A',
    timestamp: new Date()
  },
  {
    sensor_id: 'Vib_01',
    value: 0.51,
    unit: 'm/s²',
    status: 'OK',
    zone: 'Almacén A',
    timestamp: new Date()
  },
  {
    sensor_id: 'Hum_01',
    value: 45.6,
    unit: '%',
    status: 'OK',
    zone: 'Almacén A',
    timestamp: new Date()
  },
  // Motor A - 4 sensores
  {
    sensor_id: 'Temp_03',
    value: 77.5,
    unit: '°C',
    status: 'OK',
    zone: 'Motor A',
    timestamp: new Date()
  }
];

// Configuración completa de sensores adicionales
const additionalSensors = [
  // Motor A (completar 4 sensores)
  { id: 'Temp_03B', zone: 'Motor A', unit: '°C' },
  { id: 'Vib_02', zone: 'Motor A', unit: 'm/s²' },
  { id: 'Hum_02', zone: 'Motor A', unit: '%' },
  
  // Zona B (4 sensores)
  { id: 'Temp_04', zone: 'Zona B', unit: '°C' },
  { id: 'Temp_04B', zone: 'Zona B', unit: '°C' },
  { id: 'Vib_03', zone: 'Zona B', unit: 'm/s²' },
  { id: 'Hum_03', zone: 'Zona B', unit: '%' },
  
  // Motor B (4 sensores)
  { id: 'Temp_05', zone: 'Motor B', unit: '°C' },
  { id: 'Temp_05B', zone: 'Motor B', unit: '°C' },
  { id: 'Vib_04', zone: 'Motor B', unit: 'm/s²' },
  { id: 'Hum_04', zone: 'Motor B', unit: '%' }
];

// Añadir los sensores adicionales con valores iniciales apropiados
additionalSensors.forEach(sensor => {
  readings.push({
    sensor_id: sensor.id,
    value: sensor.unit === '°C' ? 75 + Math.random() * 10 : 
           sensor.unit === 'm/s²' ? 0.4 + Math.random() * 0.4 :
           40 + Math.random() * 20,
    unit: sensor.unit,
    status: 'OK',
    zone: sensor.zone,
    timestamp: new Date()
  });
});

let alerts = [];

// Historial de lecturas
let readingsHistory = [];
const MAX_HISTORY = 1000; // Mantener hasta 1000 registros históricos

// Función para formatear fecha
const formatDate = (timestamp) => {
  try {
    // Si es un string ISO, lo convertimos directamente a Date
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', timestamp);
      return 'Fecha inválida';
    }
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error en fecha';
  }
};

// Función para determinar el estado del sensor
const determineStatus = (value, unit) => {
  if (unit === '°C') {
    if (value > 85) return 'CRITICAL';
    if (value > 80) return 'ALERT';
    return 'OK';
  }
  if (unit === 'm/s²') {
    if (value > 0.9) return 'CRITICAL';
    if (value > 0.7) return 'ALERT';
    return 'OK';
  }
  if (unit === '%') {
    if (value > 60 || value < 35) return 'ALERT';
    return 'OK';
  }
  return 'OK';
};

// Función para actualizar valores simulados
const updateReadings = () => {
  const currentTime = new Date();
  readings = readings.map(reading => {
    let newValue;
    if (reading.sensor_id === 'Temp_02') {
      // Hacer que Temp_02 varíe pero nunca baje de 84.3°C
      const randomVariation = (Math.random() - 0.3) * 2;
      newValue = Math.max(84.3, reading.value + randomVariation);
    } else {
      newValue = reading.unit === '°C' ? 
                reading.value + (Math.random() - 0.5) * 2 :
                reading.unit === 'm/s²' ? 
                Math.max(0, reading.value + (Math.random() - 0.5) * 0.1) :
                Math.max(0, Math.min(100, reading.value + (Math.random() - 0.5) * 5));
    }

    // Actualizar el estado basado en el nuevo valor
    const newStatus = determineStatus(newValue, reading.unit);

    return {
      ...reading,
      value: newValue,
      status: newStatus,
      timestamp: currentTime
    };
  });

  // Actualizar alertas - incluir todos los sensores en estado ALERT o CRITICAL
  alerts = readings
    .filter(r => r.status === 'ALERT' || r.status === 'CRITICAL')
    .map(r => ({
      sensor_id: r.sensor_id,
      value: r.value,
      unit: r.unit,
      zone: r.zone,
      timestamp: currentTime,
      status: r.status
    }));

  // Guardar lecturas en el historial
  const newReadings = readings.map(reading => ({
    ...reading,
    id: `${reading.sensor_id}-${currentTime.getTime()}`,
    timestamp: currentTime
  }));
  
  readingsHistory = [...newReadings, ...readingsHistory].slice(0, MAX_HISTORY);
};

// Actualizar lecturas cada 5 segundos
setInterval(updateReadings, 5000);

exports.getSensors = (req, res) => {
  res.json(readings);
};

exports.postReading = (req, res) => {
  const data = req.body;
  readings.push(data);
  if ((data.unit === '°C' && data.value > 80) || 
      (data.unit === 'm/s²' && data.value > 0.8)) {
    alerts.push(data);
  }
  res.status(201).json({ message: 'Reading received' });
};

exports.getAlerts = (req, res) => {
  res.json(alerts);
};

exports.getHistory = (req, res) => {
  try {
    if (req.query.format === 'chat') {
      const tempSensor = readings.find(r => r.unit === '°C');
      const vibSensor = readings.find(r => r.unit === 'm/s²');
      const humSensor = readings.find(r => r.unit === '%');

      let response = '⚠️ Estado de Alertas\n' +
                    '================\n\n';

      if (tempSensor) {
        const tempStatus = tempSensor.value > 85 ? '🔴 CRÍTICO' :
                         tempSensor.value > 75 ? '🟡 Alto' :
                         '🟢 Normal';
        response += `🌡️ Temperatura: ${tempSensor.value.toFixed(2)}°C (${tempStatus})\n`;
      }

      if (vibSensor) {
        const vibStatus = vibSensor.value > 0.9 ? '🔴 CRÍTICO' :
                        vibSensor.value > 0.7 ? '🟡 Alto' :
                        '🟢 Normal';
        response += `📳 Vibración: ${vibSensor.value.toFixed(2)}m/s² (${vibStatus})\n`;
      }

      if (humSensor) {
        const humStatus = humSensor.value > 60 ? '🔴 CRÍTICO Alto' :
                        humSensor.value < 35 ? '🔴 CRÍTICO Bajo' :
                        '🟢 Normal';
        response += `💧 Humedad: ${humSensor.value.toFixed(2)}% (${humStatus})\n`;
      }

      let recomendaciones = [];
      if (tempSensor && tempSensor.value > 75) {
        recomendaciones.push('• Aumentar ventilación\n• Verificar sistema de refrigeración');
      }
      if (vibSensor && vibSensor.value > 0.7) {
        recomendaciones.push('• Revisar alineación\n• Verificar rodamientos');
      }
      if (humSensor && (humSensor.value > 60 || humSensor.value < 35)) {
        recomendaciones.push('• Ajustar sistema HVAC\n• Verificar sellos');
      }

      if (recomendaciones.length > 0) {
        response += '\n================\n⚠️ Recomendación:\n' + recomendaciones.join('\n');
      }

      response += `\n\n⏰ Actualizado: ${formatDate(new Date())}`;

      return res.json({ message: response });
    }
    // Parámetros de paginación para el historial completo
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Obtener registros paginados
    const paginatedHistory = readingsHistory
      .slice(startIndex, endIndex)
      .map(reading => ({
        sensor: reading.sensor_id,
        valor: Number(reading.value).toFixed(2),
        unidad: reading.unit,
        zona: reading.zone,
        estado: reading.status,
        hora: formatDate(reading.timestamp)
      }));

    // Preparar respuesta con metadatos de paginación
    const response = {
      items: paginatedHistory,
      total: readingsHistory.length,
      page,
      totalPages: Math.ceil(readingsHistory.length / limit),
      hasMore: endIndex < readingsHistory.length
    };

    res.json(response);
  } catch (error) {
    console.error('Error en getHistory:', error);
    res.status(500).json({ 
      error: 'Error al obtener el historial',
      details: error.message 
    });
  }
};

// Constantes para los rangos de valores
const RANGES = {
  temperature: {
    min: 20,
    max: 75,
    warning: 75,
    critical: 85,
    unit: '°C',
    consequences: {
      high: [
        'Degradación acelerada de componentes',
        'Pérdida de eficiencia operativa',
        'Riesgo de deformación en materiales',
        'Fallo prematuro de rodamientos'
      ],
      critical: [
        'Daño permanente a componentes',
        'Riesgo de incendio',
        'Fallo catastrófico inminente',
        'Deformación irreversible de materiales'
      ]
    }
  },
  vibration: {
    min: 0,
    max: 0.7,
    warning: 0.7,
    critical: 0.9,
    unit: 'm/s²',
    consequences: {
      high: [
        'Desgaste prematuro de rodamientos',
        'Desalineación progresiva',
        'Pérdida de precisión',
        'Mayor consumo energético'
      ],
      critical: [
        'Fallo inminente de rodamientos',
        'Daño estructural severo',
        'Riesgo de rotura de componentes',
        'Parada forzada necesaria'
      ]
    }
  },
  humidity: {
    min: 35,
    max: 60,
    warning_low: 35,
    warning_high: 60,
    unit: '%',
    consequences: {
      low: [
        'Aumento de electricidad estática',
        'Mayor desgaste por fricción',
        'Fragilidad en materiales',
        'Problemas en componentes electrónicos'
      ],
      high: [
        'Corrosión acelerada',
        'Formación de condensación',
        'Deterioro de aislamiento',
        'Riesgo de cortocircuitos'
      ]
    }
  }
};

// Helper function para obtener recomendaciones específicas
const getSpecificRecommendations = (type, value) => {
  const range = RANGES[type];
  let recommendations = {
    immediate: [],
    diagnostic: [],
    preventive: []
  };

  if (type === 'temperature') {
    if (value > range.critical) {
      recommendations = {
        immediate: [
          '⛔ DETENER OPERACIÓN INMEDIATAMENTE',
          'Activar sistemas de emergencia',
          'Evacuar área si es necesario'
        ],
        diagnostic: [
          'Inspección completa del sistema de refrigeración',
          'Evaluación de daños en componentes',
          'Análisis de causa raíz'
        ],
        preventive: [
          'Reemplazo de componentes afectados',
          'Actualización del sistema de refrigeración',
          'Revisión de protocolos de operación'
        ]
      };
    } else if (value > range.warning) {
      recommendations = {
        immediate: [
          'Reducir carga operativa al 50%',
          'Aumentar ventilación forzada',
          'Verificar sistema de refrigeración'
        ],
        diagnostic: [
          'Inspección de ventiladores y ductos',
          'Verificación de termostatos',
          'Análisis de tendencias térmicas'
        ],
        preventive: [
          'Limpieza de intercambiadores',
          'Calibración de sensores',
          'Mantenimiento de ventiladores'
        ]
      };
    }
  } else if (type === 'vibration') {
    if (value > range.critical) {
      recommendations = {
        immediate: [
          '⛔ PARADA DE EMERGENCIA',
          'Asegurar área circundante',
          'Notificar a mantenimiento urgente'
        ],
        diagnostic: [
          'Inspección detallada de rodamientos',
          'Análisis de espectro completo',
          'Verificación de integridad estructural'
        ],
        preventive: [
          'Reemplazo de rodamientos',
          'Realineación completa',
          'Balanceo dinámico'
        ]
      };
    } else if (value > range.warning) {
      recommendations = {
        immediate: [
          'Reducir velocidad operativa',
          'Monitoreo continuo',
          'Preparar parada programada'
        ],
        diagnostic: [
          'Medición de alineación',
          'Inspección de rodamientos',
          'Análisis de tendencias'
        ],
        preventive: [
          'Lubricación de componentes',
          'Ajuste de alineación',
          'Verificación de anclajes'
        ]
      };
    }
  } else if (type === 'humidity') {
    if (value > range.warning_high) {
      recommendations = {
        immediate: [
          'Activar deshumidificadores',
          'Verificar sellos y juntas',
          'Aumentar ventilación'
        ],
        diagnostic: [
          'Inspección de puntos de condensación',
          'Verificación de drenajes',
          'Análisis de infiltraciones'
        ],
        preventive: [
          'Mejora de sellos',
          'Instalación de barreras de vapor',
          'Optimización de HVAC'
        ]
      };
    } else if (value < range.warning_low) {
      recommendations = {
        immediate: [
          'Activar humidificadores',
          'Reducir ventilación',
          'Verificar fugas de aire'
        ],
        diagnostic: [
          'Medición de flujos de aire',
          'Verificación de sellos',
          'Análisis de pérdidas'
        ],
        preventive: [
          'Instalación de controladores',
          'Mejora de aislamiento',
          'Calibración de sistemas'
        ]
      };
    }
  }
  return recommendations;
};

// Helper function para obtener el estado del sensor con recomendaciones mejoradas
const getSensorStatus = (sensorId) => {
    const sensor = readings.find(r => r.sensor_id === sensorId);
    if (!sensor) return null;

    let status, recommendation;
    let isCritical = false;
    let isWarning = false;
    let recommendations = null;

    if (sensor.unit === '°C') {
        isCritical = sensor.value > RANGES.temperature.critical;
        isWarning = sensor.value > RANGES.temperature.warning;
        status = isCritical ? 'CRÍTICO' : isWarning ? 'ALERTA' : 'Normal';
        recommendations = getSpecificRecommendations('temperature', sensor.value);
    } else if (sensor.unit === 'm/s²') {
        isCritical = sensor.value > RANGES.vibration.critical;
        isWarning = sensor.value > RANGES.vibration.warning;
        status = isCritical ? 'CRÍTICO' : isWarning ? 'ALERTA' : 'Normal';
        recommendations = getSpecificRecommendations('vibration', sensor.value);
    } else if (sensor.unit === '%') {
        isCritical = sensor.value > RANGES.humidity.warning_high || sensor.value < RANGES.humidity.warning_low;
        isWarning = isCritical;
        status = sensor.value > RANGES.humidity.warning_high ? 'CRÍTICO Alto' :
                sensor.value < RANGES.humidity.warning_low ? 'CRÍTICO Bajo' : 'Normal';
        recommendations = getSpecificRecommendations('humidity', sensor.value);
    }

    return { 
        sensor, 
        status, 
        recommendations,
        isCritical, 
        isWarning,
        consequences: isCritical ? RANGES[sensor.unit === '°C' ? 'temperature' : 
                                  sensor.unit === 'm/s²' ? 'vibration' : 
                                  'humidity'].consequences.critical :
                     isWarning ? RANGES[sensor.unit === '°C' ? 'temperature' : 
                                      sensor.unit === 'm/s²' ? 'vibration' : 
                                      'humidity'].consequences.high :
                     null
    };
};

const {
    SpecificSensorHandler,
    TemperatureHandler,
    VibrationHandler,
    HumidityHandler,
    AlertHandler,
    StatusHandler,
    FAQHandler,
    ValueEvaluationHandler,
    ActionHandler
} = require('./chatHandlers');

exports.handleChat = (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        const { question } = req.body;
        if (!question) {
            return res.status(400).json({
                error: 'Se requiere una pregunta'
            });
        }

        // Crear la cadena de manejadores
        const valueHandler = new ValueEvaluationHandler();
        const actionHandler = new ActionHandler();
        const faqHandler = new FAQHandler();
        const specificHandler = new SpecificSensorHandler();
        const tempHandler = new TemperatureHandler();
        const vibHandler = new VibrationHandler();
        const humHandler = new HumidityHandler();
        const alertHandler = new AlertHandler();
        const statusHandler = new StatusHandler();

        // Configurar la cadena
        valueHandler
            .setNext(actionHandler)
            .setNext(faqHandler)
            .setNext(specificHandler)
            .setNext(tempHandler)
            .setNext(vibHandler)
            .setNext(humHandler)
            .setNext(alertHandler)
            .setNext(statusHandler);

        // Procesar la pregunta
        const response = valueHandler.handle(question.toLowerCase().trim(), readings);
        
        if (response) {
            res.json({ 
                message: response + `\n\n⏰ Actualizado: ${formatDate(new Date())}`
            });
        } else {
            res.json({ 
                message: '❓ No entiendo tu pregunta. Prueba preguntando por:\n' +
                        '• Un sensor específico (ej: "Vib_01")\n' +
                        '• Temperatura ("temperatura")\n' +
                        '• Vibraciones ("vibraciones")\n' +
                        '• Humedad ("humedad")\n' +
                        '• Alertas ("alertas")\n' +
                        '• Estado general ("estado")\n' +
                        '• Si un valor es normal\n' +
                        '• Qué hacer en caso de valores altos\n' +
                        '• Rangos normales de operación\n' +
                        '• Acciones preventivas\n' +
                        '• Mantenimiento preventivo'
            });
        }
    } catch (error) {
        console.error('Error en handleChat:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};