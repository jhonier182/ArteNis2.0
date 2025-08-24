// Helper para convertir propiedades de sombra obsoletas a boxShadow moderna
// Compatible con React Native Web y móvil

export const createShadow = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 0 },
  shadowOpacity: number = 0.3,
  shadowRadius: number = 4,
  elevation?: number
) => {
  // Para React Native Web, usar boxShadow
  if (typeof document !== 'undefined') {
    const rgba = hexToRgba(shadowColor, shadowOpacity);
    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${rgba}`,
    };
  }
  
  // Para React Native móvil, usar las propiedades originales
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation: elevation || shadowRadius,
  };
};

// Función helper para convertir hex a rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Sombras predefinidas comunes
export const shadows = {
  small: createShadow('#000', { width: 0, height: 2 }, 0.3, 4),
  medium: createShadow('#000', { width: 0, height: 4 }, 0.3, 8),
  large: createShadow('#000', { width: 0, height: 8 }, 0.3, 16),
  orange: createShadow('#FF9800', { width: 0, height: 4 }, 0.3, 8),
  orangeLarge: createShadow('#FF9800', { width: 0, height: 8 }, 0.3, 16),
  orangeExtraLarge: createShadow('#FF9800', { width: 0, height: 10 }, 0.5, 20),
};
