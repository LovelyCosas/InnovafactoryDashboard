const axios = require('axios');

const sensors = [
  { id: 'Temp_AlmacénA_1', type: 'temperature', unit: '°C', zone: 'Almacén A' },
  { id: 'Temp_AlmacénA_2', type: 'temperature', unit: '°C', zone: 'Almacén A' },
  { id: 'Temp_AlmacénA_3', type: 'temperature', unit: '°C', zone: 'Almacén A' },
  { id: 'Temp_AlmacénA_4', type: 'temperature', unit: '°C', zone: 'Almacén A' },
  { id: 'Vib_AlmacénA_1', type: 'vibration', unit: 'g', zone: 'Almacén A' },
  { id: 'Vib_AlmacénA_2', type: 'vibration', unit: 'g', zone: 'Almacén A' },
  { id: 'Vib_AlmacénA_3', type: 'vibration', unit: 'g', zone: 'Almacén A' },
  { id: 'Hum_AlmacénA_1', type: 'humidity', unit: '%', zone: 'Almacén A' },
  { id: 'Hum_AlmacénA_2', type: 'humidity', unit: '%', zone: 'Almacén A' },
  { id: 'Hum_AlmacénA_3', type: 'humidity', unit: '%', zone: 'Almacén A' },
  { id: 'Temp_ZonaB_1', type: 'temperature', unit: '°C', zone: 'Zona B' },
  { id: 'Temp_ZonaB_2', type: 'temperature', unit: '°C', zone: 'Zona B' },
  { id: 'Temp_ZonaB_3', type: 'temperature', unit: '°C', zone: 'Zona B' },
  { id: 'Temp_ZonaB_4', type: 'temperature', unit: '°C', zone: 'Zona B' },
  { id: 'Vib_ZonaB_1', type: 'vibration', unit: 'g', zone: 'Zona B' },
  { id: 'Vib_ZonaB_2', type: 'vibration', unit: 'g', zone: 'Zona B' },
  { id: 'Vib_ZonaB_3', type: 'vibration', unit: 'g', zone: 'Zona B' },
  { id: 'Hum_ZonaB_1', type: 'humidity', unit: '%', zone: 'Zona B' },
  { id: 'Hum_ZonaB_2', type: 'humidity', unit: '%', zone: 'Zona B' },
  { id: 'Hum_ZonaB_3', type: 'humidity', unit: '%', zone: 'Zona B' },
  { id: 'Temp_ZonaC_1', type: 'temperature', unit: '°C', zone: 'Zona C' },
  { id: 'Temp_ZonaC_2', type: 'temperature', unit: '°C', zone: 'Zona C' },
  { id: 'Temp_ZonaC_3', type: 'temperature', unit: '°C', zone: 'Zona C' },
  { id: 'Temp_ZonaC_4', type: 'temperature', unit: '°C', zone: 'Zona C' },
  { id: 'Vib_ZonaC_1', type: 'vibration', unit: 'g', zone: 'Zona C' },
  { id: 'Vib_ZonaC_2', type: 'vibration', unit: 'g', zone: 'Zona C' },
  { id: 'Vib_ZonaC_3', type: 'vibration', unit: 'g', zone: 'Zona C' },
  { id: 'Hum_ZonaC_1', type: 'humidity', unit: '%', zone: 'Zona C' },
  { id: 'Hum_ZonaC_2', type: 'humidity', unit: '%', zone: 'Zona C' },
  { id: 'Hum_ZonaC_3', type: 'humidity', unit: '%', zone: 'Zona C' },
  { id: 'Temp_ZonaTécnica_1', type: 'temperature', unit: '°C', zone: 'Zona Técnica' },
  { id: 'Temp_ZonaTécnica_2', type: 'temperature', unit: '°C', zone: 'Zona Técnica' },
  { id: 'Temp_ZonaTécnica_3', type: 'temperature', unit: '°C', zone: 'Zona Técnica' },
  { id: 'Temp_ZonaTécnica_4', type: 'temperature', unit: '°C', zone: 'Zona Técnica' },
  { id: 'Vib_ZonaTécnica_1', type: 'vibration', unit: 'g', zone: 'Zona Técnica' },
  { id: 'Vib_ZonaTécnica_2', type: 'vibration', unit: 'g', zone: 'Zona Técnica' },
  { id: 'Vib_ZonaTécnica_3', type: 'vibration', unit: 'g', zone: 'Zona Técnica' },
  { id: 'Hum_ZonaTécnica_1', type: 'humidity', unit: '%', zone: 'Zona Técnica' },
  { id: 'Hum_ZonaTécnica_2', type: 'humidity', unit: '%', zone: 'Zona Técnica' },
  { id: 'Hum_ZonaTécnica_3', type: 'humidity', unit: '%', zone: 'Zona Técnica' },
  { id: 'Temp_MotorA_1', type: 'temperature', unit: '°C', zone: 'Motor A' },
  { id: 'Temp_MotorA_2', type: 'temperature', unit: '°C', zone: 'Motor A' },
  { id: 'Temp_MotorA_3', type: 'temperature', unit: '°C', zone: 'Motor A' },
  { id: 'Temp_MotorA_4', type: 'temperature', unit: '°C', zone: 'Motor A' },
  { id: 'Vib_MotorA_1', type: 'vibration', unit: 'g', zone: 'Motor A' },
  { id: 'Vib_MotorA_2', type: 'vibration', unit: 'g', zone: 'Motor A' },
  { id: 'Vib_MotorA_3', type: 'vibration', unit: 'g', zone: 'Motor A' },
  { id: 'Hum_MotorA_1', type: 'humidity', unit: '%', zone: 'Motor A' },
  { id: 'Hum_MotorA_2', type: 'humidity', unit: '%', zone: 'Motor A' },
  { id: 'Hum_MotorA_3', type: 'humidity', unit: '%', zone: 'Motor A' }
];

function getRandomValue(type) {
  if (type === 'temperature') {
    return +(65 + Math.random() * 25).toFixed(1);
  } else if (type === 'vibration') {
    return +(0.2 + Math.random() * 1.0).toFixed(2);
  } else if (type === 'humidity') {
    return +(30 + Math.random() * 40).toFixed(1);
  }
  return 0;
}

setInterval(() => {
  sensors.forEach(sensor => {
    const value = getRandomValue(sensor.type);
    const payload = {
      sensor_id: sensor.id,
      type: sensor.type,
      value: value,
      unit: sensor.unit,
      zone: sensor.zone,
      status: (sensor.type === 'temperature' && value > 80) ||
              (sensor.type === 'vibration' && value > 0.6)
              ? 'ALERT' : 'OK',
      timestamp: new Date().toISOString()
    };

    axios.post('http://localhost:3000/api/readings', payload)
      .then(() => console.log(`Sent: ${sensor.id}`))
      .catch(err => console.error(`Error sending ${sensor.id}:`, err.message));
  });
}, 5000);
