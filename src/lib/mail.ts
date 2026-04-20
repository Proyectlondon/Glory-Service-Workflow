import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWorkflowNotification({
  to,
  subject,
  workflowName,
  message,
  actionLabel,
  actionUrl,
}: {
  to: string | string[];
  subject: string;
  workflowName: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY no configurada. Saltando envío de correo.");
    return;
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    console.log(`📡 Intentando enviar notificación a: ${recipients.join(", ")}`);
    
    const results = [];

    for (const recipient of recipients) {
      console.log(`📤 Enviando correo individual a: ${recipient}...`);
      const { data, error } = await resend.emails.send({
        from: "Glory Workflow <onboarding@resend.dev>",
        to: recipient,
        subject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h2 style="color: #1e3a8a;">Notificación de Glory Workflow</h2>
            <p>Se ha producido una actualización en el flujo de trabajo: <strong>${workflowName}</strong></p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151;">${message}</p>
            </div>
            ${
              actionUrl
                ? `
              <div style="text-align: center; margin-top: 30px;">
                <a href="${actionUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${actionLabel || "Ver Workflow"}
                </a>
              </div>
            `
                : ""
            }
            <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error(`❌ Error enviando a ${recipient}:`, error);
        results.push({ recipient, success: false, error });
      } else {
        console.log(`✅ Éxito para ${recipient}:`, data?.id);
        results.push({ recipient, success: true, data });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error("❌ Error inesperado en sendWorkflowNotification:", error);
    return { success: false, error };
  }
}
