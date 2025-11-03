import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react'
import { useAlert, AlertContainer } from '../../components/Alert'

type AppointmentType = 'presencial' | 'videollamada'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const { alerts, success, error, removeAlert } = useAlert()
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('presencial')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Días disponibles (simulado)
  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(date)
  }

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      error('Datos incompletos', 'Por favor selecciona fecha y hora')
      return
    }
    // Aquí iría la llamada al API
    success('¡Solicitud enviada!', 'Tu cita ha sido solicitada exitosamente')
    router.back()
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <Head>
        <title>Solicitar Cita - InkEndin</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-gray-800">
        <div className="container-mobile px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">Solicitar Cita</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <div className="container-mobile px-4 py-6 space-y-6">
        {/* Tipo de cita */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Tipo de cita</h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setAppointmentType('presencial')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                appointmentType === 'presencial'
                  ? 'border-blue-600 bg-blue-600/20'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              <MapPin className={`w-5 h-5 ${
                appointmentType === 'presencial' ? 'text-blue-400' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                appointmentType === 'presencial' ? 'text-white' : 'text-gray-400'
              }`}>
                Presencial
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setAppointmentType('videollamada')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                appointmentType === 'videollamada'
                  ? 'border-purple-600 bg-purple-600/20'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              <Video className={`w-5 h-5 ${
                appointmentType === 'videollamada' ? 'text-purple-400' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                appointmentType === 'videollamada' ? 'text-white' : 'text-gray-400'
              }`}>
                Videollamada
              </span>
            </motion.button>
          </div>
        </div>

        {/* Calendario */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Selecciona la fecha</h2>
          <div className="bg-[#0f1419] rounded-2xl p-4 border border-gray-800">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isSelected = isDateSelected(day)
                const isPast = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0))

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isPast && handleDateSelect(day)}
                    disabled={isPast}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'text-gray-700 cursor-not-allowed'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    {day}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hora preferida */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-sm font-medium text-gray-400 mb-3">Hora preferida</h2>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="text-sm text-gray-500">Selecciona la hora</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <motion.button
                  key={time}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTime === time
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Descripción del tatuaje */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">Describe tu tatuaje</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el tatuaje que deseas, sube imágenes de referencia o las tenes..."
            className="w-full h-32 bg-[#0f1419] border border-gray-800 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </div>

        {/* Botón Enviar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Enviar solicitud
        </motion.button>

        {/* Info adicional */}
        {appointmentType === 'videollamada' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-purple-600/10 border border-purple-600/30 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-purple-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-400 mb-1">Videollamada</h3>
                <p className="text-sm text-gray-400">
                  Recibirás un enlace para la videollamada una vez que el tatuador confirme tu cita.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Alert Container */}
      <AlertContainer alerts={alerts} />
    </div>
  )
}
