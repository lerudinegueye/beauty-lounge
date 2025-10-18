
##############################################  EN FRANCAIS ####################################

# Checklist per il Deployment

Questa è una guida per deployare correttamente l'applicazione "Beauty Lounge" in un ambiente di produzione.

## 1. Configurazione delle Variabili d'Ambiente

In produzione, non si usa il file `.env.local`. È necessario configurare le variabili d'ambiente direttamente sul servizio di hosting (es. Vercel, Netlify) o creare un file `.env.production` (meno raccomandato per motivi di sicurezza).

Le variabili da configurare sono:

### Connessione al Database
-   `DB_HOST`: L'indirizzo del tuo database di produzione.
-   `DB_USER`: L'utente per accedere al database di produzione.
-   `DB_PASSWORD`: La password per l'utente del database di produzione.
-   `DB_NAME`: Il nome del database di produzione.

**ATTENZIONE**: Non usare mai le credenziali del database di sviluppo in produzione.

### URL dell'Applicazione
-   `NEXT_PUBLIC_BASE_URL`: L'URL completo del tuo sito live (es. `https://www.beautylounge.com`).
-   `BASE_URL`: (opzionale) URL usato lato server per link nelle email; se non impostato, verrà usato `NEXT_PUBLIC_BASE_URL`.

### Pagamenti
- Stripe non è più utilizzato. Il flusso di pagamento usa Wave (numero pubblico via `NEXT_PUBLIC_WAVE_PHONE_NUMBER`).

## 2. Codice e Configurazioni

### Link e URL
- Email: i link di verifica/password reset ora usano `BASE_URL` o `NEXT_PUBLIC_BASE_URL` (fallback su `http://localhost:3000` in dev). Imposta questi valori in produzione.
- La rotta Stripe è stata rimossa. Verifica il flusso acconto Wave nell’UI di prenotazione.

## 3. Configurazione del Servizio di Hosting

1.  **Imposta le Variabili d'Ambiente**: Inserisci tutte le variabili elencate al punto 1 nell'interfaccia del tuo provider di hosting.
2.  **Comando di Build**: Assicurati che il comando di build sia impostato su `npm run build` (o l'equivalente per il tuo gestore di pacchetti).
3.  **Dominio**: Collega il tuo dominio personalizzato al progetto sul tuo provider di hosting.

## 4. VPS (Hostinger/OVH) – Guida Rapida

1. Provisioning server:
	- Ubuntu LTS consigliato, crea un utente non-root con sudo.
	- Aggiorna il sistema: `sudo apt update && sudo apt upgrade -y`.
2. Dipendenze:
	- Installa Node.js LTS (es. tramite nvm) e npm.
	- Installa MySQL/MariaDB o usa un DB gestito; crea DB e utente con permessi limitati.
3. Repo & build:
	- Clona il repo sul server.
	- Crea un file `.env` con riferimento a `.env.example` e inserisci i valori reali.
	- `npm ci` poi `npm run build`.
4. Process manager:
	- Installa pm2: `npm i -g pm2`.
	- Avvia: `pm2 start npm --name beauty-lounge -- start` (Next.js production server).
	- Abilita startup: `pm2 startup` e `pm2 save`.
5. Reverse proxy (Nginx):
	- Installa Nginx; configura un server block che punti a `http://127.0.0.1:3000`.
	- Abilita HTTPS con Certbot (Let’s Encrypt).
6. Firewall:
	- Apri porte 80/443; chiudi 3000 pubblica (solo locale).
7. Log & monitoraggio:
	- `pm2 logs` per applicazione; `journalctl -u nginx` per Nginx.

Note sicurezza:
- Imposta `SECRET_COOKIE_PASSWORD` lungo (32+ chars) e `JWT_SECRET` forte (obbligatorio in produzione).
- Usa account Gmail con App Password o un SMTP affidabile (Mailgun/Sendinblue) invece di password normale.
- Imposta `SALON_TIMEZONE` (es. `Africa/Dakar`).

DB migrazioni:
- Esegui SQL iniziali da `app/utils/schema.sql` e le migrazioni in `app/utils/migrations`/`prisma/migrations` se pertinenti.

Seguendo questi passaggi, la transizione da sviluppo a produzione avverrà senza problemi.

---

# Checklist pour le Déploiement

Ceci est un guide pour déployer correctement l'application "Beauty Lounge" dans un environnement de production.

## 1. Configuration des Variables d'Environnement

En production, le fichier `.env.local` n'est pas utilisé. Il est nécessaire de configurer les variables d'environnement directement sur le service d'hébergement (ex: Vercel, Netlify) ou de créer un fichier `.env.production` (moins recommandé pour des raisons de sécurité).

Les variables à configurer sont :

### Connexion à la Base de Données
-   `DB_HOST`: L'adresse de votre base de données de production.
-   `DB_USER`: L'utilisateur pour accéder à la base de données de production.
-   `DB_PASSWORD`: Le mot de passe de l'utilisateur de la base de données de production.
-   `DB_NAME`: Le nom de la base de données de production.

**ATTENTION**: N'utilisez jamais les identifiants de la base de données de développement en production.

### URL de l'Application
-   `NEXT_PUBLIC_BASE_URL`: L'URL complète de votre site en ligne (ex: `https://www.beautylounge.com`).

### Paiements
- Stripe n’est plus utilisé. Le flux de paiement utilise Wave (numéro public via `NEXT_PUBLIC_WAVE_PHONE_NUMBER`).

## 2. Code et Configurations

### API de Paiement
La route Stripe a été supprimée. Vérifiez le flux d’acompte Wave dans l’interface de réservation.

## 3. Configuration du Service d'Hébergement

1.  **Définir les Variables d'Environnement**: Saisissez toutes les variables listées au point 1 dans l'interface de votre fournisseur d'hébergement.
2.  **Commande de Build**: Assurez-vous que la commande de build est définie sur `npm run build` (ou l'équivalent pour votre gestionnaire de paquets).
3.  **Domaine**: Connectez votre domaine personnalisé au projet sur votre fournisseur d'hébergement.

En suivant ces étapes, la transition du développement à la production se déroulera sans problème.


############################################ EN ITALIEN #############################
# Checklist per il Deployment

Questa è una guida per deployare correttamente l'applicazione "Beauty Lounge" in un ambiente di produzione.

## 1. Configurazione delle Variabili d'Ambiente

In produzione, non si usa il file `.env.local`. È necessario configurare le variabili d'ambiente direttamente sul servizio di hosting (es. Vercel, Netlify) o creare un file `.env.production` (meno raccomandato per motivi di sicurezza).

Le variabili da configurare sono:

### Connessione al Database
-   `DB_HOST`: L'indirizzo del tuo database di produzione.
-   `DB_USER`: L'utente per accedere al database di produzione.
-   `DB_PASSWORD`: La password per l'utente del database di produzione.
-   `DB_NAME`: Il nome del database di produzione.

**ATTENZIONE**: Non usare mai le credenziali del database di sviluppo in produzione.

### URL dell'Applicazione
-   `NEXT_PUBLIC_BASE_URL`: L'URL completo del tuo sito live (es. `https://www.beautylounge.com`).

### Pagamenti
- Stripe non è più utilizzato. Il flusso di pagamento usa Wave (numero pubblico via `NEXT_PUBLIC_WAVE_PHONE_NUMBER`).

## 2. Codice e Configurazioni

### API di Checkout
La rotta Stripe è stata rimossa. Verifica il flusso acconto Wave nell’UI di prenotazione.

## 3. Configurazione del Servizio di Hosting

1.  **Imposta le Variabili d'Ambiente**: Inserisci tutte le variabili elencate al punto 1 nell'interfaccia del tuo provider di hosting.
2.  **Comando di Build**: Assicurati che il comando di build sia impostato su `npm run build` (o l'equivalente per il tuo gestore di pacchetti).
3.  **Dominio**: Collega il tuo dominio personalizzato al progetto sul tuo provider di hosting.

Seguendo questi passaggi, la transizione da sviluppo a produzione avverrà senza problemi.

