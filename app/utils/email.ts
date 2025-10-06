import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `http://localhost:3000/api/auth/verify?token=${token}`;
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Welcome to Beauty Lounge!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });
    console.log('Verification email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

/**
 * Invia un'email di conferma ordine al cliente.
 */
export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Il tuo ordine da Beauty Lounge è confermato!',
      html: `
        <h1>Grazie per il tuo acquisto!</h1>
        <p>Ciao,</p>
        <p>Il tuo ordine è stato confermato con successo. Ecco un riepilogo:</p>
        <p>Email cliente: ${orderDetails.customer_email}</p>
        <p>Importo totale: ${(orderDetails.amount_total / 100).toLocaleString('fr-FR')} ${orderDetails.currency}</p>
        <p>Grazie per aver scelto Beauty Lounge!</p>
      `,
    });
    console.log('Order confirmation email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

/**
 * Invia un'email di notifica di un nuovo ordine all'amministratore.
 */
export async function sendAdminNotificationEmail(adminEmail: string, orderDetails: any) {
  if (!adminEmail) {
    console.error('Admin email not provided. Cannot send admin notification.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `[ADMIN] Nuovo ordine ricevuto su Beauty Lounge`,
      html: `
        <h1>Notifica di Nuovo Ordine (Solo per Admin)</h1>
        <p>Un nuovo ordine è stato effettuato sul tuo sito.</p>
        <h2>Dettagli Riepilogativi:</h2>
        <ul>
          <li><strong>Email Cliente:</strong> ${orderDetails.customer_email}</li>
          <li><strong>Importo Totale:</strong> ${(orderDetails.amount_total / 100).toLocaleString('fr-FR')} ${orderDetails.currency}</li>
        </ul>
        <p>Accedi alla tua dashboard di Stripe per i dettagli completi.</p>
      `,
    });
    console.log('Admin notification email sent successfully to:', adminEmail);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
}