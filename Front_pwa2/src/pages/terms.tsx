'use client'

import { useRouter } from 'next/router'
import Head from 'next/head'
import { ChevronLeft } from 'lucide-react'

/**
 * Página de Términos y Condiciones
 * Ruta: /terms
 *
 * Esta página muestra los términos y condiciones de uso de la plataforma
 */
export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Head>
        <title>Términos y Condiciones - Inkedin</title>
        <meta name="description" content="Términos y condiciones de uso de Inkedin" />
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
            <h1 className="text-xl font-bold">Términos y Condiciones</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-mobile px-4 pt-24 pb-8 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 text-sm mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Sección 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">1. Aceptación de los Términos</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Al acceder y utilizar Inkedin, aceptas cumplir con estos Términos y Condiciones de uso. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestra plataforma.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación. 
              Es tu responsabilidad revisar periódicamente estos términos para estar informado de cualquier actualización.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">2. Descripción del Servicio</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Inkedin es una plataforma social diseñada para que los artistas de tatuajes y aficionados 
              compartan, descubran y se conecten a través del arte del tatuaje. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Publicación y visualización de contenido relacionado con tatuajes</li>
              <li>Interacción social mediante likes, comentarios y guardados</li>
              <li>Búsqueda y descubrimiento de artistas y contenido</li>
              <li>Perfiles de usuario personalizables</li>
              <li>Sistema de seguimiento entre usuarios</li>
              <li>Funcionalidades de mensajería y comunicación</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">3. Registro y Cuenta de Usuario</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">3.1. Requisitos de Registro</h3>
                <p className="text-gray-300 leading-relaxed">
                  Para utilizar ciertas funcionalidades de Inkedin, debes crear una cuenta. 
                  Al registrarte, garantizas que:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-2">
                  <li>Proporcionas información veraz, precisa y completa</li>
                  <li>Eres mayor de edad según la legislación de tu país</li>
                  <li>Mantendrás la seguridad de tu cuenta y contraseña</li>
                  <li>Eres responsable de todas las actividades que ocurran bajo tu cuenta</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">3.2. Tipos de Cuenta</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Inkedin ofrece diferentes tipos de cuentas:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li><strong>Cuenta de Artista:</strong> Para profesionales del tatuaje que desean mostrar su trabajo y servicios</li>
                  <li><strong>Cuenta de Usuario:</strong> Para aficionados y entusiastas del arte del tatuaje</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">4. Contenido del Usuario</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.1. Responsabilidad del Contenido</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Eres el único responsable del contenido que publicas en Inkedin. Esto incluye:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Imágenes, videos y fotografías de tatuajes</li>
                  <li>Textos, descripciones y comentarios</li>
                  <li>Información de perfil y datos personales compartidos</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.2. Derechos de Propiedad Intelectual</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  Al publicar contenido en Inkedin, otorgas a la plataforma una licencia no exclusiva, 
                  mundial, libre de regalías y transferible para usar, modificar, distribuir y mostrar 
                  dicho contenido en relación con el servicio.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Conservas todos los derechos de propiedad sobre tu contenido. Sin embargo, al publicar 
                  contenido que incluye diseños de tatuajes de otras personas, debes asegurarte de tener 
                  los derechos o permisos necesarios.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">4.3. Contenido Prohibido</h3>
                <p className="text-gray-300 leading-relaxed mb-2">
                  No está permitido publicar contenido que:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Sea ilegal, difamatorio, acosador o discriminatorio</li>
                  <li>Infrinja derechos de propiedad intelectual de terceros</li>
                  <li>Contenga material pornográfico, violento o explícito sin advertencias apropiadas</li>
                  <li>Promueva actividades ilegales o peligrosas</li>
                  <li>Contenga malware, virus o código malicioso</li>
                  <li>Viole la privacidad de otras personas</li>
                  <li>Sea spam o contenido promocional no autorizado</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">5. Uso Aceptable</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Al utilizar Inkedin, te comprometes a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Respetar a otros usuarios y mantener un ambiente positivo y respetuoso</li>
              <li>No utilizar la plataforma para actividades fraudulentas o engañosas</li>
              <li>No intentar acceder a cuentas de otros usuarios o sistemas</li>
              <li>No utilizar bots, scripts automatizados o herramientas que interfieran con el servicio</li>
              <li>No copiar, reproducir o distribuir contenido sin autorización</li>
              <li>Reportar contenido o comportamiento inapropiado cuando lo encuentres</li>
            </ul>
          </section>

          {/* Sección 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">6. Propiedad Intelectual</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Todos los derechos de propiedad intelectual sobre la plataforma Inkedin, incluyendo su diseño, 
              funcionalidades, logos y marcas, pertenecen a sus propietarios. Estos elementos están protegidos 
              por leyes de derechos de autor, marcas registradas y otras leyes aplicables.
            </p>
            <p className="text-gray-300 leading-relaxed">
              No puedes copiar, modificar, distribuir, vender o alquilar cualquier parte de nuestros servicios 
              sin nuestro consentimiento previo por escrito.
            </p>
          </section>

          {/* Sección 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">7. Privacidad</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              La protección de tu privacidad es importante para nosotros. El uso de tu información personal 
              está regido por nuestra Política de Privacidad, que forma parte integral de estos Términos y Condiciones.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Al utilizar Inkedin, consientes el procesamiento de tus datos personales de acuerdo con nuestra 
              Política de Privacidad.
            </p>
          </section>

          {/* Sección 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Inkedin se proporciona "tal cual" y "según disponibilidad". No garantizamos que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-4">
              <li>El servicio esté siempre disponible, ininterrumpido o libre de errores</li>
              <li>Los defectos sean corregidos</li>
              <li>El servicio cumpla con tus expectativas específicas</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mb-4">
              En la medida máxima permitida por la ley, Inkedin no será responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Daños indirectos, incidentales, especiales o consecuentes</li>
              <li>Pérdida de datos, beneficios o oportunidades comerciales</li>
              <li>Contenido publicado por otros usuarios</li>
              <li>Acciones de terceros que utilicen o accedan a nuestros servicios</li>
            </ul>
          </section>

          {/* Sección 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">9. Terminación</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nos reservamos el derecho de suspender o terminar tu acceso a Inkedin en cualquier momento, 
              con o sin causa, y con o sin previo aviso, por cualquier motivo, incluyendo pero no limitado a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-4">
              <li>Violación de estos Términos y Condiciones</li>
              <li>Actividades fraudulentas o abusivas</li>
              <li>Publicación de contenido prohibido</li>
              <li>Actividades que puedan dañar o comprometer la seguridad de otros usuarios</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              También puedes terminar tu cuenta en cualquier momento eliminando tu perfil desde la configuración 
              de tu cuenta.
            </p>
          </section>

          {/* Sección 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">10. Servicios de Terceros</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Inkedin puede contener enlaces a sitios web o servicios de terceros. No somos responsables del 
              contenido, políticas de privacidad o prácticas de sitios web o servicios de terceros.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Tu interacción con terceros, incluyendo pagos y otras transacciones, está sujeta a los términos 
              y políticas de esos terceros.
            </p>
          </section>

          {/* Sección 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">11. Modificaciones del Servicio</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto de Inkedin 
              en cualquier momento, incluyendo pero no limitado a funcionalidades, contenido y disponibilidad.
            </p>
            <p className="text-gray-300 leading-relaxed">
              No seremos responsables ante ti ni ante ningún tercero por cualquier modificación, suspensión 
              o discontinuación del servicio.
            </p>
          </section>

          {/* Sección 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Estos Términos y Condiciones se rigen por las leyes del país donde opera Inkedin. 
              Cualquier disputa relacionada con estos términos será resuelta en los tribunales competentes de esa jurisdicción.
            </p>
          </section>

          {/* Sección 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">13. Disposiciones Generales</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">13.1. Integridad del Acuerdo</h3>
                <p className="text-gray-300 leading-relaxed">
                  Estos Términos y Condiciones, junto con nuestra Política de Privacidad, constituyen el acuerdo 
                  completo entre tú e Inkedin respecto al uso de nuestros servicios.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">13.2. Divisibilidad</h3>
                <p className="text-gray-300 leading-relaxed">
                  Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones 
                  restantes permanecerán en pleno vigor y efecto.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">13.3. Renuncia</h3>
                <p className="text-gray-300 leading-relaxed">
                  El hecho de que no ejerzamos algún derecho o disposición de estos términos no constituye una 
                  renuncia a tal derecho o disposición.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 14 */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">14. Contacto</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Si tienes preguntas, comentarios o inquietudes sobre estos Términos y Condiciones, puedes contactarnos a través de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Email: legal@inkedin.com</li>
              <li>Soporte: soporte@inkedin.com</li>
            </ul>
          </section>

          {/* Advertencia final */}
          <div className="mt-12 p-6 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">Importante:</strong> Al continuar utilizando Inkedin, confirmas que has leído, 
              entendido y aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno de estos 
              términos, por favor, deja de utilizar nuestros servicios inmediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

