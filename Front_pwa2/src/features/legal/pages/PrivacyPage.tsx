'use client'

import { useRouter } from 'next/router'
import Head from 'next/head'
import { ChevronLeft } from 'lucide-react'

/**
 * Página de Política de Privacidad
 * 
 * Esta página muestra la política de privacidad de la plataforma
 */
export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Head>
        <title>Política de Privacidad - Inkedin</title>
        <meta name="description" content="Política de privacidad de Inkedin" />
      </Head>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-sm border-b border-neutral-800">
        <div className="container-mobile px-4 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Política de Privacidad</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-mobile px-4 pt-24 pb-8 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 text-sm mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Introducción */}
          <section className="mb-8">
            <p className="text-gray-300 leading-relaxed mb-4">
              En Inkedin, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tus datos personales. 
              Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos tu información 
              cuando utilizas nuestra plataforma.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Al utilizar Inkedin, aceptas las prácticas descritas en esta política. Si no estás de acuerdo con alguna 
              parte de esta política, te recomendamos que no utilices nuestros servicios.
            </p>
          </section>

          {/* Sección 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">1. Información que Recopilamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">1.1. Información que Proporcionas Directamente</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Recopilamos información que proporcionas voluntariamente al crear una cuenta, completar tu perfil o usar nuestros servicios:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Información de registro:</strong> Nombre de usuario, correo electrónico, contraseña</li>
                  <li><strong>Información de perfil:</strong> Nombre completo, foto de perfil, biografía, ubicación, tipo de cuenta (artista/usuario)</li>
                  <li><strong>Contenido que publicas:</strong> Imágenes, videos, textos, descripciones de tatuajes, comentarios</li>
                  <li><strong>Información de contacto:</strong> Correo electrónico, información de contacto para citas (si aplica)</li>
                  <li><strong>Preferencias:</strong> Configuraciones de privacidad, notificaciones, preferencias de contenido</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">1.2. Información Recopilada Automáticamente</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Cuando utilizas Inkedin, recopilamos automáticamente cierta información:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo de permanencia, interacciones (likes, comentarios, guardados)</li>
                  <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, sistema operativo, identificadores únicos</li>
                  <li><strong>Información de conexión:</strong> Dirección IP, tipo de navegador, proveedor de servicios de internet</li>
                  <li><strong>Información de ubicación:</strong> Ubicación aproximada basada en tu dirección IP (con tu consentimiento)</li>
                  <li><strong>Cookies y tecnologías similares:</strong> Para mejorar la funcionalidad y experiencia del usuario</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">1.3. Información de Terceros</h3>
                <p className="text-gray-300 leading-relaxed">
                  Podemos recibir información sobre ti de servicios de terceros cuando autorizas la conexión de tu cuenta 
                  con esos servicios (por ejemplo, redes sociales, servicios de autenticación).
                </p>
              </div>
            </div>
          </section>

          {/* Sección 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">2. Cómo Utilizamos tu Información</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Utilizamos la información recopilada para los siguientes fines:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Proporcionar y mejorar nuestros servicios:</strong> Gestionar tu cuenta, mostrar contenido relevante, personalizar tu experiencia</li>
              <li><strong>Comunicación:</strong> Enviarte notificaciones, actualizaciones, mensajes de soporte y comunicaciones relacionadas con el servicio</li>
              <li><strong>Seguridad y prevención de fraude:</strong> Detectar, prevenir y abordar actividades fraudulentas, abusivas o ilegales</li>
              <li><strong>Análisis y mejoras:</strong> Analizar el uso de la plataforma para mejorar nuestros servicios, funcionalidades y experiencia del usuario</li>
              <li><strong>Publicidad y marketing:</strong> Mostrar anuncios relevantes (con tu consentimiento) y enviar comunicaciones promocionales</li>
              <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales, responder a solicitudes gubernamentales y proteger nuestros derechos</li>
              <li><strong>Investigación:</strong> Realizar investigaciones y análisis anónimos sobre el uso de la plataforma</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">3. Compartir Información</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">3.1. Información Pública</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Cierta información de tu perfil es visible públicamente para todos los usuarios de Inkedin:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Nombre de usuario y nombre de perfil</li>
                  <li>Foto de perfil</li>
                  <li>Biografía y descripción</li>
                  <li>Contenido que publiques (con las configuraciones de privacidad que elijas)</li>
                  <li>Número de seguidores y seguidos (si aplica)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">3.2. Información Compartida con Terceros</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  No vendemos tu información personal. Podemos compartir información con terceros en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Proveedores de servicios:</strong> Compartimos datos con proveedores que nos ayudan a operar la plataforma (hosting, análisis, soporte técnico)</li>
                  <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley, orden judicial o proceso legal</li>
                  <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad, o la de nuestros usuarios</li>
                  <li><strong>Transferencias comerciales:</strong> En caso de fusión, adquisición o venta de activos (con notificación previa)</li>
                  <li><strong>Con tu consentimiento:</strong> Cuando autorices explícitamente el compartir información</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">4. Almacenamiento y Seguridad</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.1. Medidas de Seguridad</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Cifrado de datos en tránsito (HTTPS/SSL)</li>
                  <li>Cifrado de contraseñas usando algoritmos seguros</li>
                  <li>Control de acceso y autenticación</li>
                  <li>Monitoreo y detección de actividades sospechosas</li>
                  <li>Backups regulares de datos</li>
                  <li>Actualizaciones regulares de seguridad</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.2. Retención de Datos</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Conservamos tu información durante el tiempo necesario para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Proporcionar nuestros servicios</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-2">
                  Cuando elimines tu cuenta, eliminaremos o anonimizaremos tu información personal, excepto cuando 
                  estemos obligados legalmente a conservarla.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.3. Transferencias Internacionales</h3>
                <p className="text-gray-300 leading-relaxed">
                  Tu información puede ser transferida y procesada en países distintos al tuyo. Nos aseguramos de que 
                  dichas transferencias cumplan con las leyes aplicables de protección de datos y implementemos 
                  salvaguardas apropiadas.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">5. Tus Derechos y Opciones</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">5.1. Acceso y Control</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Tienes derecho a:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Acceder:</strong> Solicitar una copia de la información personal que tenemos sobre ti</li>
                  <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
                  <li><strong>Eliminar:</strong> Solicitar la eliminación de tu información personal</li>
                  <li><strong>Restringir:</strong> Limitar el procesamiento de tu información en ciertas circunstancias</li>
                  <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado y comúnmente usado</li>
                  <li><strong>Oponerse:</strong> Oponerte al procesamiento de tu información para ciertos fines</li>
                  <li><strong>Retirar consentimiento:</strong> Retirar tu consentimiento cuando el procesamiento se base en consentimiento</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">5.2. Configuraciones de Privacidad</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Puedes controlar tu privacidad a través de las siguientes opciones:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Configurar la visibilidad de tu perfil (público/privado)</li>
                  <li>Controlar quién puede ver tus publicaciones</li>
                  <li>Gestionar quién puede seguirte</li>
                  <li>Configurar notificaciones push y por correo</li>
                  <li>Gestionar cookies y tecnologías de seguimiento</li>
                  <li>Eliminar o desactivar tu cuenta</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">5.3. Cómo Ejercer tus Derechos</h3>
                <p className="text-gray-300 leading-relaxed">
                  Para ejercer cualquiera de estos derechos, puedes contactarnos a través de la configuración de tu cuenta 
                  o enviando una solicitud a <strong className="text-white">privacy@inkedin.com</strong>. Responderemos a tu 
                  solicitud dentro de los plazos establecidos por la ley aplicable.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">6. Cookies y Tecnologías de Seguimiento</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la plataforma 
              y personalizar el contenido y los anuncios.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">6.1. Tipos de Cookies que Utilizamos</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico de la plataforma</li>
                  <li><strong>Cookies de funcionalidad:</strong> Recuerdan tus preferencias y configuraciones</li>
                  <li><strong>Cookies de análisis:</strong> Nos ayudan a entender cómo utilizas la plataforma</li>
                  <li><strong>Cookies de publicidad:</strong> Utilizadas para mostrar anuncios relevantes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">6.2. Gestión de Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  Puedes gestionar tus preferencias de cookies a través de la configuración de tu navegador o nuestras 
                  opciones de privacidad. Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad 
                  de la plataforma.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">7. Menores de Edad</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Inkedin no está dirigido a menores de 18 años (o la edad mínima legal en tu jurisdicción). 
              No recopilamos intencionalmente información personal de menores de edad.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Si descubrimos que hemos recopilado información de un menor sin el consentimiento apropiado, 
              tomaremos medidas para eliminar esa información de nuestros servidores. Si eres padre o tutor 
              y crees que tu hijo ha proporcionado información personal, contáctanos inmediatamente.
            </p>
          </section>

          {/* Sección 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">8. Enlaces a Sitios de Terceros</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nuestra plataforma puede contener enlaces a sitios web o servicios de terceros. No somos responsables 
              de las prácticas de privacidad o el contenido de estos sitios externos.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Te recomendamos que revises las políticas de privacidad de cualquier sitio web de terceros que visites 
              a través de enlaces en nuestra plataforma.
            </p>
          </section>

          {/* Sección 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">9. Cambios a esta Política</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas 
              o por razones legales, operativas o regulatorias.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Te notificaremos sobre cambios materiales mediante:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Notificación en la plataforma</li>
              <li>Correo electrónico a la dirección asociada con tu cuenta</li>
              <li>Actualización de la fecha de &quot;Última actualización&quot; en esta página</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Tu uso continuado de Inkedin después de cualquier cambio constituye tu aceptación de la política revisada.
            </p>
          </section>

          {/* Sección 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">10. Leyes Aplicables</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Esta Política de Privacidad se rige por las leyes de protección de datos aplicables en tu jurisdicción, 
              incluyendo pero no limitado a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Reglamento General de Protección de Datos (RGPD) de la Unión Europea</li>
              <li>Ley de Privacidad del Consumidor de California (CCPA) si aplica</li>
              <li>Otras leyes de protección de datos aplicables en tu país</li>
            </ul>
          </section>

          {/* Sección 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">11. Autoridades Supervisoras</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Si tienes preocupaciones sobre cómo manejamos tu información personal, tienes derecho a presentar una 
              queja ante la autoridad supervisora de protección de datos en tu país.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Te recomendamos que primero nos contactes para resolver cualquier problema antes de presentar una queja formal.
            </p>
          </section>

          {/* Sección 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">12. Contacto</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Si tienes preguntas, comentarios o inquietudes sobre esta Política de Privacidad o sobre cómo manejamos 
              tu información personal, puedes contactarnos a través de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li><strong>Email de privacidad:</strong> privacy@inkedin.com</li>
              <li><strong>Email de soporte:</strong> soporte@inkedin.com</li>
              <li><strong>Desde la aplicación:</strong> Configuración → Ayuda y Soporte</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              Nos comprometemos a responder a tus consultas dentro de los plazos establecidos por la ley aplicable.
            </p>
          </section>

          {/* Advertencia final */}
          <div className="mt-12 p-6 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-gray-300 leading-relaxed mb-2">
              <strong className="text-white">Tu Privacidad es Importante para Nosotros</strong>
            </p>
            <p className="text-gray-300 leading-relaxed">
              En Inkedin, nos comprometemos a proteger tu privacidad y ser transparentes sobre cómo recopilamos, 
              utilizamos y compartimos tu información. Al utilizar nuestros servicios, confías en nosotros con tu 
              información, y no tomamos esa responsabilidad a la ligera.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

