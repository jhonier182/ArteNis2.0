// Utilidades para manejo de fechas

// Obtener fecha actual
export const getCurrentDate = (): Date => {
  return new Date();
};

// Obtener fecha actual en formato ISO
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

// Obtener timestamp actual
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Verificar si una fecha es válida
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Convertir string a Date
export const stringToDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

// Convertir Date a string ISO
export const dateToISOString = (date: Date): string => {
  return date.toISOString();
};

// Obtener diferencia en días entre dos fechas
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Obtener diferencia en horas entre dos fechas
export const getHoursDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600));
};

// Obtener diferencia en minutos entre dos fechas
export const getMinutesDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 60));
};

// Obtener diferencia en segundos entre dos fechas
export const getSecondsDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / 1000);
};

// Verificar si una fecha es hoy
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Verificar si una fecha es ayer
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

// Verificar si una fecha es mañana
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
};

// Verificar si una fecha es esta semana
export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return date >= startOfWeek && date <= endOfWeek;
};

// Verificar si una fecha es este mes
export const isThisMonth = (date: Date): boolean => {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// Verificar si una fecha es este año
export const isThisYear = (date: Date): boolean => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear();
};

// Obtener inicio del día
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Obtener fin del día
export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Obtener inicio de la semana
export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day;
  newDate.setDate(diff);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Obtener fin de la semana
export const getEndOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + 6;
  newDate.setDate(diff);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Obtener inicio del mes
export const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Obtener fin del mes
export const getEndOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1, 0);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Obtener inicio del año
export const getStartOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(0, 1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Obtener fin del año
export const getEndOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(11, 31);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// Agregar días a una fecha
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Agregar semanas a una fecha
export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

// Agregar meses a una fecha
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

// Agregar años a una fecha
export const addYears = (date: Date, years: number): Date => {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};

// Restar días de una fecha
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

// Restar semanas de una fecha
export const subtractWeeks = (date: Date, weeks: number): Date => {
  return addWeeks(date, -weeks);
};

// Restar meses de una fecha
export const subtractMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

// Restar años de una fecha
export const subtractYears = (date: Date, years: number): Date => {
  return addYears(date, -years);
};

// Obtener edad a partir de fecha de nacimiento
export const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Verificar si es año bisiesto
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Obtener días en un mes
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

// Obtener nombre del día de la semana
export const getDayName = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, { weekday: 'long' });
};

// Obtener nombre del mes
export const getMonthName = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, { month: 'long' });
};

// Obtener nombre del mes por número
export const getMonthNameByNumber = (month: number, locale: string = 'es-ES'): string => {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString(locale, { month: 'long' });
};

// Formatear fecha para input date
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatear fecha para input datetime-local
export const formatDateTimeForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Obtener rango de fechas
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Obtener fechas de la semana
export const getWeekDates = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  return getDateRange(startOfWeek, addDays(startOfWeek, 6));
};

// Obtener fechas del mes
export const getMonthDates = (date: Date): Date[] => {
  const startOfMonth = getStartOfMonth(date);
  const endOfMonth = getEndOfMonth(date);
  return getDateRange(startOfMonth, endOfMonth);
};

// Verificar si dos fechas son el mismo día
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Verificar si dos fechas son el mismo mes
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Verificar si dos fechas son el mismo año
export const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

// Obtener zona horaria del usuario
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convertir fecha a zona horaria específica
export const convertToTimezone = (date: Date, timezone: string): Date => {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

// Obtener offset de zona horaria en minutos
export const getTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset();
};

export default {
  getCurrentDate,
  getCurrentDateISO,
  getCurrentTimestamp,
  isValidDate,
  stringToDate,
  dateToISOString,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  getSecondsDifference,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subtractDays,
  subtractWeeks,
  subtractMonths,
  subtractYears,
  getAge,
  isLeapYear,
  getDaysInMonth,
  getDayName,
  getMonthName,
  getMonthNameByNumber,
  formatDateForInput,
  formatDateTimeForInput,
  getDateRange,
  getWeekDates,
  getMonthDates,
  isSameDay,
  isSameMonth,
  isSameYear,
  getUserTimezone,
  convertToTimezone,
  getTimezoneOffset
};
