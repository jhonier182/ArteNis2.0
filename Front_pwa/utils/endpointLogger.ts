// Logger global simple para endpoints
class EndpointLogger {
  private static instance: EndpointLogger;
  private logs: Array<{
    endpoint: string;
    method: string;
    responseTime: number;
    statusCode: number;
    timestamp: number;
  }> = [];

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true';
  }

  private isEnabled: boolean = false;

  static getInstance(): EndpointLogger {
    if (!EndpointLogger.instance) {
      EndpointLogger.instance = new EndpointLogger();
    }
    return EndpointLogger.instance;
  }

  // Log de llamada a endpoint
  logEndpoint(endpoint: string, method: string, responseTime: number, statusCode: number) {
    if (!this.isEnabled) return;

    const log = {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now()
    };

    this.logs.push(log);

    // Categorizar velocidad
    let speedIndicator = '';
    if (responseTime < 100) {
      speedIndicator = '⚡ EXCELENTE';
    } else if (responseTime < 500) {
      speedIndicator = '✅ BUENA';
    } else if (responseTime < 1000) {
      speedIndicator = '⚠️ LENTA';
    } else if (responseTime < 3000) {
      speedIndicator = '🐌 MUY LENTA';
    } else {
      speedIndicator = '🚨 CRÍTICA';
    }

    // Color según status code
    let statusColor = '🟢';
    if (statusCode >= 400) {
      statusColor = '🔴';
    } else if (statusCode >= 300) {
      statusColor = '🟡';
    }

    return
  }

  // Mostrar estadísticas de endpoints
  showStats() {
    if (!this.isEnabled) return;

    const totalCalls = this.logs.length;
    if (totalCalls === 0) {
      return;
    }

    const averageTime = this.logs.reduce((sum, log) => sum + log.responseTime, 0) / totalCalls;
    const slowestEndpoints = this.logs
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 5);

    console.group('📊 Estadísticas de Endpoints');
    
    
    console.groupEnd();
  }

  // Limpiar logs
  clearLogs() {
    this.logs = []; 
    return
  }

  // Habilitar/deshabilitar logging
  enable() {
    this.isEnabled = true;
    return
  }

  disable() {
    this.isEnabled = false;
    return
  }
}

// Instancia global
const endpointLogger = EndpointLogger.getInstance();

// Exportar para uso
export default endpointLogger;

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  (window as any).endpointLogger = endpointLogger;
}
