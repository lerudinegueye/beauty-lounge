
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

### Chiavi API di Stripe
Per accettare pagamenti reali, devi usare le chiavi API **Live** di Stripe. Le puoi trovare nella tua dashboard di Stripe.

-   `STRIPE_SECRET_KEY`: La tua chiave segreta live (inizia con `sk_live_...`).
-   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: La tua chiave pubblicabile live (inizia con `pk_live_...`).

## 2. Codice e Configurazioni

### API di Checkout (`app/api/checkout/route.ts`)
Il codice è già configurato correttamente per usare l'URL di origine della richiesta (`req.nextUrl.origin`) per gli URL di successo e di annullamento del pagamento. **Non sono necessarie modifiche in questo file.**

## 3. Configurazione del Servizio di Hosting

1.  **Imposta le Variabili d'Ambiente**: Inserisci tutte le variabili elencate al punto 1 nell'interfaccia del tuo provider di hosting.
2.  **Comando di Build**: Assicurati che il comando di build sia impostato su `npm run build` (o l'equivalente per il tuo gestore di pacchetti).
3.  **Dominio**: Collega il tuo dominio personalizzato al progetto sul tuo provider di hosting.

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

### Clés API de Stripe
Pour accepter des paiements réels, vous devez utiliser les clés API **Live** de Stripe. Vous pouvez les trouver dans votre tableau de bord Stripe.

-   `STRIPE_SECRET_KEY`: Votre clé secrète live (commence par `sk_live_...`).
-   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Votre clé publiable live (commence par `pk_live_...`).

## 2. Code et Configurations

### API de Paiement (`app/api/checkout/route.ts`)
Le code est déjà correctement configuré pour utiliser l'URL d'origine de la requête (`req.nextUrl.origin`) pour les URL de succès et d'annulation du paiement. **Aucune modification n'est nécessaire dans ce fichier.**

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

### Chiavi API di Stripe
Per accettare pagamenti reali, devi usare le chiavi API **Live** di Stripe. Le puoi trovare nella tua dashboard di Stripe.

-   `STRIPE_SECRET_KEY`: La tua chiave segreta live (inizia con `sk_live_...`).
-   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: La tua chiave pubblicabile live (inizia con `pk_live_...`).

## 2. Codice e Configurazioni

### API di Checkout (`app/api/checkout/route.ts`)
Il codice è già configurato correttamente per usare l'URL di origine della richiesta (`req.nextUrl.origin`) per gli URL di successo e di annullamento del pagamento. **Non sono necessarie modifiche in questo file.**

## 3. Configurazione del Servizio di Hosting

1.  **Imposta le Variabili d'Ambiente**: Inserisci tutte le variabili elencate al punto 1 nell'interfaccia del tuo provider di hosting.
2.  **Comando di Build**: Assicurati che il comando di build sia impostato su `npm run build` (o l'equivalente per il tuo gestore di pacchetti).
3.  **Dominio**: Collega il tuo dominio personalizzato al progetto sul tuo provider di hosting.

Seguendo questi passaggi, la transizione da sviluppo a produzione avverrà senza problemi.

