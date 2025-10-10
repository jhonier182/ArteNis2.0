import { useCallback } from 'react';
import endpointLogger from '../utils/endpointLogger';

// Hook para logging de endpoints
export const useEndpointLogger = () => {
  const logEndpoint = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;
      
      endpointLogger.logEndpoint(endpoint, method, responseTime, 200);
      
      return result;
    } catch (error: any) {
      const responseTime = performance.now() - startTime;
      const statusCode = error.response?.status || 500;
      
      endpointLogger.logEndpoint(endpoint, method, responseTime, statusCode);
      
      throw error;
    }
  }, []);

  return { logEndpoint };
};
