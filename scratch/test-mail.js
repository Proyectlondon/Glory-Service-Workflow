const { Resend } = require('resend');

const resend = new Resend('re_gGPDZd3d_9yw44eZ9gVwn896QhS84jFLk');

async function testMail() {
  console.log('Iniciando prueba de envío con Resend...');
  try {
    const { data, error } = await resend.emails.send({
      from: 'Glory Workflow <onboarding@resend.dev>',
      to: 'johnestebanlondon@gmail.com', // Probando con el correo probable del usuario (basado en el repo)
      subject: 'Prueba Técnica de Notificaciones',
      html: '<strong>Si lees esto, la API Key funciona correctamente.</strong>'
    });

    if (error) {
      console.error('❌ Error de Resend:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Éxito:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error('❌ Error inesperado:', e);
  }
}

testMail();
