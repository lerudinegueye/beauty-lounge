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
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl.replace(/\/$/, '')}/api/auth/verify?token=${token}`;
  
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

export async function sendContactFormEmail(to: string, adminEmail: string, formData: { firstName: string; lastName: string; email: string; phone: string; message: string; }) {
  if (!adminEmail) {
    console.error('Admin email not provided for contact form notification.');
    return;
  }

  try {
    // Send email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Votre message a été reçu par Beauty Lounge',
      html: `
        <h1>Merci de nous avoir contactés !</h1>
        <p>Bonjour ${formData.firstName} ${formData.lastName},</p>
        <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
        <h2>Récapitulatif de votre message :</h2>
        <ul>
          <li><strong>Prénom :</strong> ${formData.firstName}</li>
          <li><strong>Nom :</strong> ${formData.lastName}</li>
          <li><strong>Email :</strong> ${formData.email}</li>
          <li><strong>Téléphone :</strong> ${formData.phone}</li>
          <li><strong>Message :</strong> ${formData.message}</li>
        </ul>
        <p>Merci d'avoir choisi Beauty Lounge !</p>
      `,
    });
    console.log('Contact form confirmation email sent successfully to customer:', to);

    // Send email to the admin
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `[ADMIN] Nouveau message du formulaire de contact`,
      html: `
        <h1>Notification de Nouveau Message (Admin Uniquement)</h1>
        <p>Un nouveau message a été reçu via le formulaire de contact de votre site.</p>
        <h2>Détails du message :</h2>
        <ul>
          <li><strong>Prénom :</strong> ${formData.firstName}</li>
          <li><strong>Nom :</strong> ${formData.lastName}</li>
          <li><strong>Email :</strong> ${formData.email}</li>
          <li><strong>Téléphone :</strong> ${formData.phone}</li>
          <li><strong>Message :</strong> ${formData.message}</li>
        </ul>
      `,
    });
    console.log('Contact form notification email sent successfully to admin:', adminEmail);

  } catch (error) {
    console.error('Error sending contact form emails:', error);
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
  <p>Consultez votre tableau de bord d’administration pour plus de détails.</p>
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
export async function sendBookingConfirmationEmail(
  to: string,
  bookingDetails: { cardTitle: string; cardPrice: number; firstName: string; bookingDate: string; bookingTime: string; bookingId?: number }
) {
  try {
    const deposit = 15000;
    const remainderNumber = Math.max(0, (bookingDetails.cardPrice || 0) - deposit);
    const remainderLine =
      remainderNumber > 0
        ? `<p>Le solde de <strong>${remainderNumber.toLocaleString('fr-FR')} CFA</strong> sera à régler sur place.</p>`
        : '';

    const wavePhone = process.env.NEXT_PUBLIC_WAVE_PHONE_NUMBER || '221789907905';
    const waveDeepLink = `wave://send?phone=${wavePhone.replace(/\s/g, '')}&amount=${deposit}&message=${encodeURIComponent(`Acompte Réservation #${bookingDetails.bookingId ?? ''}`)}`;
    const paymentInstructions = `
      <h2>Comment payer l'acompte</h2>
      <p>
        • Ouvrez l'application Wave et envoyez <strong>${deposit.toLocaleString('fr-FR')} CFA</strong> au numéro
        <strong style="font-family: monospace;">${wavePhone}</strong>.
      </p>
      <p>
        • Dans la note du transfert, indiquez votre <strong>ID de réservation</strong> :
        <strong style="font-family: monospace;">${bookingDetails.bookingId ?? ''}</strong>.
      </p>
      <p>
        • Sur mobile, vous pouvez aussi <a href="${waveDeepLink}">cliquer ici pour ouvrir Wave</a> avec le montant prérempli.
      </p>
    `;

    const html = `
      <h1>Merci pour votre réservation !</h1>
      <p>Bonjour ${bookingDetails.firstName},</p>
      <p>Nous avons bien reçu votre demande de réservation pour <strong>${bookingDetails.cardTitle}</strong> le <strong>${new Date(bookingDetails.bookingDate).toLocaleDateString('fr-FR')} à ${bookingDetails.bookingTime}</strong>.</p>
      <p>Pour valider votre rendez-vous, un acompte de <strong>${deposit.toLocaleString('fr-FR')} CFA</strong> est requis.</p>
      <p>Après réception et vérification de votre acompte, vous recevrez un e-mail de confirmation final.</p>
      ${remainderLine}
      ${paymentInstructions}
      <p>Nous vous remercions pour votre confiance.</p>
      <p>Merci d'avoir choisi Beauty Lounge !</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Nous avons bien reçu votre demande de réservation',
      html,
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

export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Réinitialisez votre mot de passe',
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Ce lien expirera dans une heure.</p>
      `,
    });
    console.log('E-mail de réinitialisation de mot de passe envoyé avec succès à :', to);
  } catch (error) {
    console.error("Erreur l'envoi de l'e-mail de réinitialisation de mot de passe :", error);
  }
}
