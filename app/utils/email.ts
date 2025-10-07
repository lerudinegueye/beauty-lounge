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
      subject: 'Vérifiez votre adresse e-mail',
      html: `
        <h1>Bienvenue chez Beauty Lounge !</h1>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse e-mail :</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    });
    console.log('E-mail de vérification envoyé avec succès à :', to);
  } catch (error) {
    console.error("Erreur l'envoi de l'e-mail de vérification :", error);
  }
}

export async function sendOrderConfirmationEmail(to: string, orderDetails: any) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Votre commande chez Beauty Lounge est confirmée !',
      html: `
        <h1>Merci pour votre achat !</h1>
        <p>Bonjour ${orderDetails.customer_name || ''},</p>
        <p>Votre commande a été confirmée avec succès. Voici un résumé :</p>
        <ul>
          <li><strong>Nom du client :</strong> ${orderDetails.customer_name}</li>
          <li><strong>Email :</strong> ${orderDetails.customer_email}</li>
          <li><strong>Téléphone :</strong> ${orderDetails.customer_phone || 'N/A'}</li>
          <li><strong>Date de commande :</strong> ${new Date(orderDetails.order_date).toLocaleString('fr-FR')}</li>
          <li><strong>Montant total :</strong> ${(orderDetails.amount_total).toLocaleString('fr-FR')} ${orderDetails.currency}</li>
        </ul>
        <p>Merci d'avoir choisi Beauty Lounge !</p>
      `,
    });
    console.log('E-mail de confirmation de commande envoyé avec succès à :', to);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de confirmation de commande :", error);
  }
}

/**
 * Invia un'email di notifica di un nuovo ordine all'amministratore.
 */
export async function sendAdminNotificationEmail(adminEmail: string, orderDetails: any) {
  if (!adminEmail) {
    console.error('E-mail administrateur non fourni. Notification administrateur non envoyée.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `[ADMIN] Nouvelle commande reçue sur Beauty Lounge`,
      html: `
        <h1>Notification de Nouvelle Commande (Admin Uniquement)</h1>
        <p>Une nouvelle commande a été passée sur votre site.</p>
        <h2>Détails récapitulatifs :</h2>
        <ul>
          <li><strong>Nom du client :</strong> ${orderDetails.customer_name}</li>
          <li><strong>E-mail du client :</strong> ${orderDetails.customer_email}</li>
          <li><strong>Téléphone du client :</strong> ${orderDetails.customer_phone}</li>
          <li><strong>Date de commande :</strong> ${new Date(orderDetails.order_date).toLocaleString('fr-FR')}</li>
          <li><strong>Montant total :</strong> ${(orderDetails.amount_total).toLocaleString('fr-FR')} ${orderDetails.currency}</li>
        </ul>
        <p>Connectez-vous à votre tableau de bord Stripe pour plus de détails.</p>
      `,
    });
    console.log('E-mail de notification administrateur envoyé avec succès à :', adminEmail);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail de notification administrateur :", error);
  }
}

// Alla fine del file, aggiungi queste due funzioni:

/**
 * Invia un'email di conferma prenotazione al cliente.
 */
export async function sendBookingConfirmationEmail(to: string, bookingDetails: { cardTitle: string; cardPrice: number; firstName: string; bookingDate: string; bookingTime: string; }) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Votre réservation chez Beauty Lounge est confirmée !',
      html: `
        <h1>Merci pour votre réservation !</h1>
        <p>Bonjour ${bookingDetails.firstName},</p>
        <p>Votre réservation pour <strong>${bookingDetails.cardTitle}</strong> le <strong>${new Date(bookingDetails.bookingDate).toLocaleDateString('fr-FR')} à ${bookingDetails.bookingTime}</strong> a été confirmée avec succès.</p>
        <p>Nous vous remercions pour votre confiance.</p>
        <p>Merci d'avoir choisi Beauty Lounge !</p>
      `,
    });
    console.log('Booking confirmation email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
}

/**
 * Invia un'email di notifica di una nuova prenotazione all'amministratore.
 */
export async function sendBookingAdminNotificationEmail(adminEmail: string, bookingDetails: { cardTitle: string; customerEmail: string; phoneNumber: string; firstName: string; lastName: string; bookingDate: string; bookingTime: string; }) {
  if (!adminEmail) {
    console.error('Admin email not provided. Cannot send admin notification.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `[ADMIN] Nouvelle réservation reçue sur Beauty Lounge`,
      html: `
        <h1>Notification de Nouvelle Réservation (Admin Uniquement)</h1>
        <p>Une nouvelle réservation a été effectuée sur votre site.</p>
        <h2>Détails de la réservation :</h2>
        <ul>
          <li><strong>Client :</strong> ${bookingDetails.firstName} ${bookingDetails.lastName}</li>
          <li><strong>Service réservé :</strong> ${bookingDetails.cardTitle}</li>
          <li><strong>Date et heure du traitement :</strong> ${new Date(bookingDetails.bookingDate).toLocaleDateString('fr-FR')} à ${bookingDetails.bookingTime}</li>
          <li><strong>Email du client :</strong> ${bookingDetails.customerEmail}</li>
          <li><strong>Téléphone du client :</strong> ${bookingDetails.phoneNumber}</li>
        </ul>
        <p>Veuillez contacter le client pour finaliser la réservation.</p>
      `,
    });
    console.log('Admin booking notification email sent successfully to:', adminEmail);
  } catch (error) {
    console.error('Error sending admin booking notification email:', error);
  }
}