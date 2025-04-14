// Clase base para los manejadores
class ChatHandler {
    constructor() {
        this.nextHandler = null;
    }

    setNext(handler) {
        this.nextHandler = handler;
        return handler;
    }

    handle(question, readings) {
        if (this.nextHandler) {
            return this.nextHandler.handle(question, readings);
        }
        return null;
    }

    formatResponse(title, content) {
        // Agregamos emojis y formato mejorado
        return `📊 ${title}\n═══════════════════\n\n${content}`;
    }
}

// Manejador para consultas de sensores específicos
class SpecificSensorHandler extends ChatHandler {
    handle(question, readings) {
        const sensorMatch = question.match(/(vib|temp|hum)_(\d{2})/i);
        if (!sensorMatch) {
            return super.handle(question, readings);
        }

        const sensorId = sensorMatch[0].replace(/vib/i, 'Vib')
                                     .replace(/temp/i, 'Temp')
                                     .replace(/hum/i, 'Hum');
        const sensor = readings.find(r => r.sensor_id === sensorId);
        
        if (!sensor) {
            return `[!] SENSOR NO ENCONTRADO
--------------------
- Sensor ${sensorId} no disponible
- Verificar ID del sensor
- Comprobar conexión`;
        }

        const value = sensor.value.toFixed(sensor.unit === 'm/s²' ? 2 : 1);
        let status = '✅ NORMAL';
        let recommendations = [];

        if (sensor.unit === 'm/s²') {
            if (value > 0.9) {
                status = '❌ CRITICO';
                recommendations = [
                    '1. Parada inmediata requerida',
                    '2. Inspeccionar rodamientos',
                    '3. Verificar alineación'
                ];
            } else if (value > 0.7) {
                status = '⚠️ ALERTA';
                recommendations = [
                    '1. Reducir velocidad operativa',
                    '2. Aumentar monitoreo',
                    '3. Planificar mantenimiento'
                ];
            }
        } else if (sensor.unit === '°C') {
            if (value > 85) {
                status = '❌ CRITICO';
                recommendations = [
                    '1. Reducir carga inmediatamente',
                    '2. Verificar refrigeración',
                    '3. Preparar parada si persiste'
                ];
            } else if (value > 75) {
                status = '⚠️ ALERTA';
                recommendations = [
                    '1. Aumentar ventilación',
                    '2. Verificar temperatura',
                    '3. Monitorear tendencia'
                ];
            }
        } else if (sensor.unit === '%') {
            if (value > 60) {
                status = '❌ CRITICO ALTO';
                recommendations = [
                    '1. Activar deshumidificación',
                    '2. Aumentar ventilación',
                    '3. Verificar sellos'
                ];
            } else if (value < 35) {
                status = '❌ CRITICO BAJO';
                recommendations = [
                    '1. Activar humidificadores',
                    '2. Reducir ventilación',
                    '3. Verificar sellos'
                ];
            }
        }

        let response = `ESTADO ${sensorId}
--------------------
- Valor: ${value} ${sensor.unit}
- Estado: ${status}
- Zona: ${sensor.zone}`;

        if (recommendations.length > 0) {
            response += `\n\n[!] ACCIONES REQUERIDAS\n${recommendations.join('\n')}`;
        } else {
            response += `\n\n[OK] OPERACION NORMAL
- Continuar monitoreo regular
- Mantener mantenimiento preventivo`;
        }

        return response;
    }
}

// Manejador para consultas de temperatura
class TemperatureHandler extends ChatHandler {
    handle(question, readings) {
        if (!question.match(/temperatura|temp\b/i)) {
            return super.handle(question, readings);
        }

        const tempSensors = readings.filter(r => r.unit === '°C' && r.sensor_id.endsWith('01'));
        if (tempSensors.length === 0) {
            return 'TEMPERATURA\n--------------------\n❌ No hay sensores de temperatura disponibles';
        }

        let response = 'TEMPERATURA\n--------------------\n\n';
        
        tempSensors.forEach(sensor => {
            const value = sensor.value.toFixed(1);
            let status, recommendations = '';
            
            if (value > 85) {
                status = '❌ CRÍTICO';
                recommendations = '\nAcciones requeridas:\n- Reducir carga\n- Verificar refrigeración\n- Preparar parada';
            } else if (value > 75) {
                status = '⚠️ ALERTA';
                recommendations = '\nRecomendaciones:\n- Aumentar ventilación\n- Monitorear tendencia';
            } else {
                status = '✅ NORMAL';
            }
            
            response += `${sensor.sensor_id}: ${value}°C\nEstado: ${status}${recommendations}\n\n`;
        });

        return response;
    }
}

// Manejador para consultas de vibración
class VibrationHandler extends ChatHandler {
    handle(question, readings) {
        if (!question.match(/vibracion|vibraciones|vib\b/i)) {
            return super.handle(question, readings);
        }

        const vibSensors = readings.filter(r => r.unit === 'm/s²' && r.sensor_id.endsWith('01'));
        if (vibSensors.length === 0) {
            return this.formatResponse('❌ SIN DATOS',
                'No hay sensores de vibración disponibles');
        }

        let content = '📊 EVALUACIÓN GENERAL\n\n';
        
        content += vibSensors.map(sensor => {
            const value = sensor.value.toFixed(2);
            let status, icon;
            if (value > 0.9) {
                status = 'CRÍTICO';
                icon = '🔴';
            } else if (value > 0.7) {
                status = 'ALERTA';
                icon = '⚠️';
            } else {
                status = 'NORMAL';
                icon = '✅';
            }
            return `${icon} ${sensor.sensor_id}: ${value} m/s²\nEstado: ${status}`;
        }).join('\n\n');

        return content;
    }
}

// Manejador para consultas de humedad
class HumidityHandler extends ChatHandler {
    handle(question, readings) {
        if (!question.match(/humedad|hum\b/i)) {
            return super.handle(question, readings);
        }

        const humSensors = readings.filter(r => r.unit === '%');
        if (humSensors.length === 0) {
            return this.formatResponse('❌ SIN DATOS',
                'No hay sensores de humedad disponibles');
        }

        let content = humSensors.map(sensor => {
            const value = sensor.value.toFixed(1);
            const status = value > 60 || value < 35 ? '❌' : '✅';
            return `${status} ${sensor.sensor_id}: ${value}%`;
        }).join('\n');

        return this.formatResponse('💧 HUMEDAD', content);
    }
}

// Manejador para consultas de alertas
class AlertHandler extends ChatHandler {
    handle(question, readings) {
        if (!question.match(/alerta|alertas|problema|problemas/i)) {
            return super.handle(question, readings);
        }

        const alerts = readings.filter(sensor => {
            const value = sensor.value;
            return (sensor.unit === '°C' && value > 75) ||
                   (sensor.unit === 'm/s²' && value > 0.7) ||
                   (sensor.unit === '%' && (value > 60 || value < 35));
        });

        if (alerts.length === 0) {
            return this.formatResponse('✅ ESTADO NORMAL',
                'No hay alertas activas en este momento\n' +
                '• Todos los sensores en rango normal\n' +
                '• Monitoreo continuo activo');
        }

        let content = alerts.map(sensor => {
            const value = sensor.value.toFixed(sensor.unit === 'm/s²' ? 2 : 1);
            const status = this.getAlertStatus(sensor);
            return `${status.icon} ${sensor.sensor_id}: ${value} ${sensor.unit}\n` +
                   `   ↳ ${status.message}`;
        }).join('\n\n');

        return this.formatResponse('⚠️ ALERTAS ACTIVAS', content);
    }

    getAlertStatus(sensor) {
        if (sensor.unit === '°C') {
            return sensor.value > 85 ? 
                   { icon: '❌', message: 'Temperatura crítica - Revisar refrigeración' } :
                   { icon: '⚠️', message: 'Temperatura alta - Aumentar ventilación' };
        }
        if (sensor.unit === 'm/s²') {
            return sensor.value > 0.9 ?
                   { icon: '❌', message: 'Vibración crítica - Parada inmediata' } :
                   { icon: '⚠️', message: 'Vibración alta - Reducir velocidad' };
        }
        if (sensor.unit === '%') {
            return sensor.value > 60 ?
                   { icon: '❌', message: 'Humedad alta - Activar deshumidificación' } :
                   { icon: '❌', message: 'Humedad baja - Activar humidificación' };
        }
    }
}

// Manejador para consultas de estado general
class StatusHandler extends ChatHandler {
    handle(question, readings) {
        if (!question.match(/estado|como esta|cómo está/i)) {
            return super.handle(question, readings);
        }

        let content = '';
        let criticalCount = 0;
        let warningCount = 0;
        let normalCount = 0;

        // Agrupar sensores por tipo
        const types = {
            '°C': { icon: '🌡️', name: 'TEMPERATURAS', sensors: [] },
            'm/s²': { icon: '💫', name: 'VIBRACIONES', sensors: [] },
            '%': { icon: '💧', name: 'HUMEDAD', sensors: [] }
        };

        // Clasificar sensores
        readings.forEach(sensor => {
            if (types[sensor.unit]) {
                types[sensor.unit].sensors.push(sensor);
                
                // Determinar estado
                if (sensor.unit === '°C') {
                    if (sensor.value > 85) criticalCount++;
                    else if (sensor.value > 75) warningCount++;
                    else normalCount++;
                }
                else if (sensor.unit === 'm/s²') {
                    if (sensor.value > 0.9) criticalCount++;
                    else if (sensor.value > 0.7) warningCount++;
                    else normalCount++;
                }
                else if (sensor.unit === '%') {
                    if (sensor.value > 60 || sensor.value < 35) criticalCount++;
                    else normalCount++;
                }
            }
        });

        // Generar reporte por tipo
        Object.values(types).forEach(type => {
            if (type.sensors.length > 0) {
                content += `${type.icon} ${type.name}\n`;
                type.sensors.forEach(sensor => {
                    let statusIcon = '✅';
                    if (sensor.unit === '°C') {
                        if (sensor.value > 85) statusIcon = '❌';
                        else if (sensor.value > 75) statusIcon = '⚠️';
                    }
                    else if (sensor.unit === 'm/s²') {
                        if (sensor.value > 0.9) statusIcon = '❌';
                        else if (sensor.value > 0.7) statusIcon = '⚠️';
                    }
                    else if (sensor.unit === '%') {
                        if (sensor.value > 60 || sensor.value < 35) statusIcon = '❌';
                    }
                    
                    const value = sensor.value.toFixed(sensor.unit === 'm/s²' ? 2 : 1);
                    content += `${statusIcon} ${sensor.sensor_id}: ${value} ${sensor.unit}\n`;
                });
                content += '\n';
            }
        });

        // Añadir resumen
        content += `📋 RESUMEN\n`;
        content += `• Total sensores: ${readings.length}\n`;
        if (criticalCount > 0) {
            content += `• Críticos: ${criticalCount} 🚨\n`;
            content += `• Alertas: ${warningCount} ⚠️\n`;
            content += `• Normales: ${normalCount} ✅\n\n`;
            content += `❗ ACCIONES REQUERIDAS\n`;
            content += `• Revisar sensores críticos\n`;
            content += `• Preparar mantenimiento\n`;
            content += `• Monitorear tendencias`;
        } else if (warningCount > 0) {
            content += `• Alertas: ${warningCount} ⚠️\n`;
            content += `• Normales: ${normalCount} ✅\n\n`;
            content += `⚠️ RECOMENDACIONES\n`;
            content += `• Aumentar monitoreo\n`;
            content += `• Planificar revisión`;
        } else {
            content += `• Normales: ${normalCount} ✅\n\n`;
            content += `✅ SISTEMA ESTABLE\n`;
            content += `• Operación normal\n`;
            content += `• Continuar monitoreo`;
        }

        return this.formatResponse('📊 ESTADO DEL SISTEMA', content);
    }
}

// Manejador para preguntas frecuentes
class FAQHandler extends ChatHandler {
    handle(question, readings) {
        const normalizedQuestion = this.normalizeQuestion(question);
        const response = this.getFAQResponse(normalizedQuestion, readings);
        
        if (response) {
            return response;
        }
        
        return super.handle(question, readings);
    }

    normalizeQuestion(question) {
        return question
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, '');
    }

    getFAQResponse(question, readings) {
        // Consulta de rangos normales
        if (question.match(/rango.*normal|valor.*normal|valor.*aceptable|rango.*ideal/)) {
            return `RANGOS ACEPTABLES
--------------------

VIBRACIÓN
✅ 0.0 - 0.7 m/s²

TEMPERATURA
✅ 20 - 75 °C

HUMEDAD
✅ 35 - 60 %`;
        }

        // Revisión de vibración alta
        if (question.match(/revisar.*vib.*|que.*revisar.*vib.*|check.*vib.*/)) {
            return `PROTOCOLO DE REVISIÓN - VIBRACIÓN
--------------------

1. INSPECCIÓN INMEDIATA
- Rodamientos
- Alineación
- Balanceo

2. MEDICIONES
- Espectro de vibración
- Temperatura de cojinetes
- Consumo de energía

3. VERIFICACIONES
- Estado de lubricación
- Pernos de anclaje
- Acoplamientos

❗ Si vibración > 0.9 m/s²:
• Parada inmediata requerida
• Inspección completa
• Mantenimiento correctivo`;
        }

        // Revisión de humedad por zona
        if (question.match(/revisar.*hum.*zona|check.*hum.*zona|como.*revisar.*hum/)) {
            return `PROTOCOLO DE REVISIÓN - HUMEDAD
--------------------

1. VERIFICACIONES IN SITU
- Sensor de humedad
- Fugas de aire/agua
- Condensación visible

2. MEDICIONES
- Humedad relativa
- Temperatura ambiente
- Flujo de aire

3. INSPECCIÓN DE SISTEMAS
- Estado del HVAC
- Sellos y juntas
- Ventilación

❗ RANGOS POR ZONA:
• Zona A: 40-55%
• Zona B: 35-50%
• Zona C: 45-60%`;
        }

        // Sensores fuera de rango
        if (question.match(/fuera.*rango|sensor.*fuera|valor.*fuera/)) {
            return `PROTOCOLO - SENSORES FUERA DE RANGO
--------------------

1. ACCIONES INMEDIATAS
- Verificar lectura
- Confirmar calibración
- Revisar histórico

2. EVALUACIÓN
- Identificar tendencia
- Verificar causas
- Documentar hallazgos

3. ACCIONES CORRECTIVAS
- Ajustar parámetros
- Realizar mantenimiento
- Calibrar sensores

❗ PRIORIDADES:
• CRÍTICO (❌): Acción inmediata
• ALERTA (⚠️): 24 horas máx.
• REVISIÓN (ℹ️): Siguiente turno`;
        }

        // Sensor defectuoso o mal funcionamiento
        if (question.match(/sensor.*mal|sensor.*defectuoso|sensor.*falla|sensor.*error/)) {
            return `PROTOCOLO - SENSOR DEFECTUOSO
--------------------

1. DIAGNÓSTICO INICIAL
- Verificar alimentación eléctrica
- Comprobar conexiones
- Revisar configuración

2. VERIFICACIONES
- Comparar con sensores cercanos
- Analizar histórico de lecturas
- Realizar prueba de calibración

3. ACCIONES CORRECTIVAS
- Recalibrar si es posible
- Limpiar/reparar sensor
- Reemplazar si necesario

4. DOCUMENTACIÓN
- Registrar incidente
- Documentar acciones tomadas
- Actualizar historial

❗ IMPORTANTE:
• No ignorar lecturas erráticas
• Mantener sensor redundante
• Validar después de reparación`;
        }

        // Problemas específicos
        if (question.match(/impacto.*vibra|efecto.*vibra/)) {
            return this.formatResponse('⚠️ IMPACTO DE VIBRACIONES ALTAS',
                '🔹 EFECTOS INMEDIATOS\n' +
                '• Desgaste acelerado de rodamientos\n' +
                '• Pérdida de alineación\n' +
                '• Aflojamiento de componentes\n\n' +
                '🔹 DAÑOS A LARGO PLAZO\n' +
                '• Fatiga de materiales\n' +
                '• Fallo de rodamientos\n' +
                '• Daño estructural\n\n' +
                '🔹 IMPACTO OPERATIVO\n' +
                '• Mayor consumo de energía\n' +
                '• Reducción de vida útil\n' +
                '• Paradas no programadas');
        }

        if (question.match(/problema.*90.*c|efecto.*90.*c/)) {
            return this.formatResponse('⚠️ IMPACTO DE TEMPERATURA ALTA (90°C)',
                '🔹 EFECTOS INMEDIATOS\n' +
                '• Degradación de lubricantes\n' +
                '• Expansión térmica excesiva\n' +
                '• Estrés en materiales\n\n' +
                '🔹 DAÑOS POTENCIALES\n' +
                '• Deformación permanente\n' +
                '• Fallo de componentes\n' +
                '• Riesgo de incendio\n\n' +
                '🔹 ACCIONES NECESARIAS\n' +
                '• Parada inmediata\n' +
                '• Inspección completa\n' +
                '• Mantenimiento correctivo');
        }

        if (question.match(/efecto.*hum.*alta|impacto.*hum.*alta/)) {
            return this.formatResponse('⚠️ IMPACTO DE HUMEDAD ALTA',
                '🔹 EFECTOS INMEDIATOS\n' +
                '• Corrosión acelerada\n' +
                '• Problemas eléctricos\n' +
                '• Formación de condensación\n\n' +
                '🔹 DAÑOS A LARGO PLAZO\n' +
                '• Deterioro de aislamiento\n' +
                '• Oxidación de componentes\n' +
                '• Crecimiento de moho\n\n' +
                '🔹 IMPACTO OPERATIVO\n' +
                '• Fallos eléctricos\n' +
                '• Degradación de materiales\n' +
                '• Mayor mantenimiento');
        }

        // Mantenimiento preventivo
        if (question.match(/cuando.*mantenimiento|mantenimiento.*preventivo/)) {
            return this.formatResponse('🔧 GUÍA DE MANTENIMIENTO PREVENTIVO',
                '🔹 FRECUENCIA RECOMENDADA\n' +
                '• Inspección visual: Diaria\n' +
                '• Verificación básica: Semanal\n' +
                '• Mantenimiento completo: Mensual\n\n' +
                '🔹 INDICADORES PARA ADELANTAR\n' +
                '• Vibraciones > 0.6 m/s²\n' +
                '• Temperatura > 70 °C\n' +
                '• Humedad fuera de 40-55%\n\n' +
                '🔹 TAREAS PRINCIPALES\n' +
                '• Lubricación de componentes\n' +
                '• Verificación de alineación\n' +
                '• Limpieza de sistemas');
        }

        // Múltiples problemas
        if (question.match(/vibra.*temp.*alta|temp.*vibra.*alta/)) {
            return this.formatResponse('⚠️ VIBRACIÓN Y TEMPERATURA ALTAS',
                '🔹 ACCIONES INMEDIATAS\n' +
                '• Reducir carga al 50%\n' +
                '• Aumentar refrigeración\n' +
                '• Preparar parada si persiste\n\n' +
                '🔹 DIAGNÓSTICO\n' +
                '• Revisar rodamientos\n' +
                '• Verificar lubricación\n' +
                '• Inspeccionar refrigeración\n\n' +
                '🔹 PREVENCIÓN\n' +
                '• Mantenimiento completo\n' +
                '• Mejorar monitoreo\n' +
                '• Actualizar sistemas');
        }

        // Medidas preventivas para vibración
        if (question.match(/medida.*prevent.*vibra|como.*evitar.*vibra|prevenir.*vibra/)) {
            return `PREVENCIÓN DE VIBRACIONES
--------------------

1. MANTENIMIENTO REGULAR
- Lubricación semanal
- Alineación mensual
- Balanceo trimestral

2. MONITOREO
- Control diario de niveles
- Medición de temperatura
- Análisis de tendencias

3. INSPECCIONES
- Pernos y anclajes
- Estado de rodamientos
- Acoplamientos

✅ RANGOS SEGUROS
• Normal: < 0.7 m/s²
• Revisar: 0.6 - 0.7 m/s²
• Intervenir: > 0.7 m/s²`;
        }

        // Prevención de problemas de humedad
        if (question.match(/evitar.*humed|prevenir.*humed|como.*evitar.*hum/)) {
            return `PREVENCIÓN DE HUMEDAD
--------------------

1. CONTROL AMBIENTAL
- Ventilación adecuada
- Control de temperatura
- Monitoreo continuo

2. MANTENIMIENTO
- Revisión de sellos
- Limpieza de filtros
- Calibración HVAC

3. INSPECCIONES
- Fugas de aire/agua
- Puntos de condensación
- Estado de aislamiento

✅ RANGOS ÓPTIMOS
• Zona A: 40-55%
• Zona B: 35-50%
• Zona C: 45-60%`;
        }

        // Prevención de fallos en sensores
        if (question.match(/prevenir.*fallo.*sensor|evitar.*fallo.*sensor|mantener.*sensor/)) {
            return `PREVENCIÓN DE FALLOS - SENSORES
--------------------

1. MANTENIMIENTO PREVENTIVO
- Limpieza mensual
- Calibración trimestral
- Verificación conexiones

2. MONITOREO
- Registro de lecturas
- Análisis de desviaciones
- Verificación cruzada

3. PROTECCIÓN
- Protección ambiental
- Respaldo eléctrico
- Redundancia crítica

❗ SEÑALES DE ATENCIÓN
• Lecturas erráticas
• Respuesta lenta
• Desviación progresiva`;
        }

        return null;
    }
}

class ValueEvaluationHandler extends ChatHandler {
    handle(question, readings) {
        const normalizedQuestion = question.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Evaluar vibración específica
        let vibMatch = normalizedQuestion.match(/vib_(\d{2}).*?(\d+\.?\d*)g?/);
        if (vibMatch) {
            const sensorId = `Vib_${vibMatch[1]}`;
            const value = parseFloat(vibMatch[2]);
            
            let evaluation = '';
            if (value > 0.9) {
                evaluation = `🔴 VALOR CRÍTICO (${value} m/s²)\n` +
                           `ESTADO\n` +
                           `• Por encima del límite seguro (0.9 m/s²)\n` +
                           `• Requiere atención inmediata\n\n` +
                           `⚠️ ACCIONES REQUERIDAS\n` +
                           `• Reducir carga operativa\n` +
                           `• Inspeccionar rodamientos\n` +
                           `• Programar mantenimiento`;
            } else if (value > 0.7) {
                evaluation = `🟡 VALOR ELEVADO (${value} m/s²)\n` +
                           `ESTADO\n` +
                           `• Por encima de lo normal (0.7 m/s²)\n` +
                           `• Requiere monitoreo cercano\n\n` +
                           `⚠️ RECOMENDACIONES\n` +
                           `• Aumentar frecuencia de monitoreo\n` +
                           `• Verificar lubricación\n` +
                           `• Planificar revisión preventiva`;
            } else {
                evaluation = `🟢 VALOR NORMAL (${value} m/s²)\n` +
                           `ESTADO\n` +
                           `• Dentro del rango seguro (0.0 - 0.7 m/s²)\n` +
                           `• Operación correcta\n\n` +
                           `ℹ️ MANTENIMIENTO\n` +
                           `• Continuar monitoreo regular\n` +
                           `• Mantener plan de lubricación`;
            }
            
            return this.formatResponse(`📊 EVALUACIÓN ${sensorId}`, evaluation);
        }

        // Evaluar temperatura específica
        let tempMatch = normalizedQuestion.match(/temp.*?(\d+).*?c/i);
        if (tempMatch || normalizedQuestion.includes("temperatura") && normalizedQuestion.match(/(\d+).*?c/i)) {
            const value = parseFloat(tempMatch ? tempMatch[1] : normalizedQuestion.match(/(\d+).*?c/i)[1]);
            
            let evaluation = '';
            if (value > 85) {
                evaluation = `🚨 TEMPERATURA CRÍTICA (${value}°C)\n` +
                           `• Por encima del límite seguro (85°C)\n` +
                           `• Riesgo de daño al equipo\n\n` +
                           `❗ ACCIONES REQUERIDAS\n` +
                           `1. Reducir carga operativa\n` +
                           `2. Verificar sistema de refrigeración\n` +
                           `3. Preparar parada si persiste`;
            } else if (value > 75) {
                evaluation = `⚠️ TEMPERATURA ELEVADA (${value}°C)\n` +
                           `• Por encima de lo normal (75°C)\n` +
                           `• Requiere atención\n\n` +
                           `📌 RECOMENDACIONES\n` +
                           `1. Verificar ventilación\n` +
                           `2. Revisar refrigeración\n` +
                           `3. Aumentar monitoreo`;
            } else if (value < 20) {
                evaluation = `⚠️ TEMPERATURA BAJA (${value}°C)\n` +
                           `• Por debajo de lo normal (20°C)\n` +
                           `• Verificar operación\n\n` +
                           `📌 RECOMENDACIONES\n` +
                           `1. Verificar sensor\n` +
                           `2. Revisar carga de trabajo\n` +
                           `3. Monitorear rendimiento`;
            } else {
                evaluation = `✅ TEMPERATURA NORMAL (${value}°C)\n` +
                           `• Dentro del rango óptimo (20-75°C)\n` +
                           `• Operación correcta\n\n` +
                           `📌 MANTENIMIENTO\n` +
                           `• Continuar monitoreo regular\n` +
                           `• Mantener ventilación`;
            }
            
            return this.formatResponse('🌡️ EVALUACIÓN TEMPERATURA', evaluation);
        }

        // Evaluar humedad específica
        let humMatch = normalizedQuestion.match(/hum.*?(\d+).*?%/i);
        if (humMatch || normalizedQuestion.includes("humedad") && normalizedQuestion.match(/(\d+).*?%/i)) {
            const value = parseFloat(humMatch ? humMatch[1] : normalizedQuestion.match(/(\d+).*?%/i)[1]);
            
            let evaluation = '';
            if (value > 60) {
                evaluation = `🚨 HUMEDAD ALTA (${value}%)\n` +
                           `• Por encima del límite seguro (60%)\n` +
                           `• Riesgo de condensación\n\n` +
                           `❗ ACCIONES REQUERIDAS\n` +
                           `1. Aumentar ventilación\n` +
                           `2. Verificar sellos\n` +
                           `3. Activar deshumidificación`;
            } else if (value < 35) {
                evaluation = `🚨 HUMEDAD BAJA (${value}%)\n` +
                           `• Por debajo del límite seguro (35%)\n` +
                           `• Riesgo de estática\n\n` +
                           `❗ ACCIONES REQUERIDAS\n` +
                           `1. Verificar sistema HVAC\n` +
                           `2. Activar humidificadores\n` +
                           `3. Monitorear equipos sensibles`;
            } else {
                evaluation = `✅ HUMEDAD NORMAL (${value}%)\n` +
                           `• Dentro del rango óptimo (35-60%)\n` +
                           `• Operación correcta\n\n` +
                           `📌 MANTENIMIENTO\n` +
                           `• Continuar monitoreo regular\n` +
                           `• Mantener ventilación`;
            }
            
            return this.formatResponse('💧 EVALUACIÓN HUMEDAD', evaluation);
        }

        // Evaluar normalidad general
        if (normalizedQuestion.match(/normal|correcto|bien|esta bien/)) {
            const criticalSensors = [];
            const warningSensors = [];
            const normalSensors = [];

            readings.filter(sensor => sensor.sensor_id.endsWith('01')).forEach(sensor => {
                if (sensor.unit === '°C') {
                    if (sensor.value > 85) criticalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(1)}°C`);
                    else if (sensor.value > 75) warningSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(1)}°C`);
                    else normalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(1)}°C`);
                }
                else if (sensor.unit === 'm/s²') {
                    if (sensor.value > 0.9) criticalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(2)} m/s²`);
                    else if (sensor.value > 0.7) warningSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(2)} m/s²`);
                    else normalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(2)} m/s²`);
                }
                else if (sensor.unit === '%') {
                    if (sensor.value > 60 || sensor.value < 35) criticalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(1)}%`);
                    else normalSensors.push(`${sensor.sensor_id}: ${sensor.value.toFixed(1)}%`);
                }
            });

            let evaluation = '';
            if (criticalSensors.length > 0) {
                evaluation += `🚨 SENSORES CRÍTICOS\n`;
                criticalSensors.forEach(sensor => evaluation += `• ${sensor}\n`);
                evaluation += `\n`;
            }
            if (warningSensors.length > 0) {
                evaluation += `⚠️ SENSORES EN ALERTA\n`;
                warningSensors.forEach(sensor => evaluation += `• ${sensor}\n`);
                evaluation += `\n`;
            }
            if (normalSensors.length > 0) {
                evaluation += `✅ SENSORES NORMALES\n`;
                normalSensors.forEach(sensor => evaluation += `• ${sensor}\n`);
                evaluation += `\n`;
            }

            if (criticalSensors.length === 0 && warningSensors.length === 0) {
                evaluation += `📌 CONCLUSIÓN\n• Todos los valores están dentro de rangos normales\n• Continuar con monitoreo regular`;
            } else {
                evaluation += `❗ RECOMENDACIÓN\n• Revisar sensores marcados\n• Tomar acciones correctivas`;
            }

            return this.formatResponse('📊 EVALUACIÓN GENERAL', evaluation);
        }

        return super.handle(question, readings);
    }
}

class ActionHandler extends ChatHandler {
    handle(question, readings) {
        const normalizedQuestion = question.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Acciones para humedad baja
        if (normalizedQuestion.match(/que.*hacer.*hum.*baja|humedad.*baja/)) {
            return `PROTOCOLO PARA HUMEDAD BAJA
--------------------

ACCIONES INMEDIATAS
- Activar humidificadores
- Reducir ventilación
- Verificar sellos

DIAGNOSTICO
- Medir flujos de aire
- Revisar fugas
- Verificar sistema HVAC

PREVENCION
- Instalar controladores
- Mejorar sellado
- Mantener sistema HVAC

[!] IMPORTANTE
- Si < 35%: Acción correctiva inmediata
- Rango óptimo: 35-60%`;
        }

        // Acciones para temperatura alta
        if (normalizedQuestion.match(/que.*hacer.*temp.*alta|temperatura.*alta/)) {
            return `PROTOCOLO PARA TEMPERATURA ALTA
--------------------

ACCIONES INMEDIATAS
- Aumentar ventilación
- Reducir carga operativa
- Verificar refrigeración

DIAGNOSTICO
- Inspeccionar sistema de enfriamiento
- Verificar flujo de aire
- Revisar termostatos

PREVENCION
- Limpiar intercambiadores
- Calibrar sensores
- Optimizar ventilación

[!] IMPORTANTE
- Si supera 85°C: Parada inmediata
- Si supera 75°C: Monitoreo continuo`;
        }

        // Acciones para vibración alta
        if (normalizedQuestion.match(/que.*hacer.*vibra.*alta|vibra.*supera/)) {
            return `PROTOCOLO PARA VIBRACION ALTA
--------------------

ACCIONES INMEDIATAS
- Reducir velocidad al 50%
- Verificar carga
- Inspección visual

DIAGNOSTICO
- Medir alineación
- Revisar rodamientos
- Analizar espectro de vibración

PREVENCION
- Programar mantenimiento
- Ajustar alineación
- Balancear componentes

[!] IMPORTANTE
- Si persiste > 0.9 m/s²: Parada inmediata
- Si continúa > 0.7 m/s²: Mantenimiento urgente`;
        }

        return super.handle(question, readings);
    }
}

module.exports = {
    ChatHandler,
    ValueEvaluationHandler,
    SpecificSensorHandler,
    TemperatureHandler,
    VibrationHandler,
    HumidityHandler,
    AlertHandler,
    StatusHandler,
    FAQHandler,
    ActionHandler
}; 