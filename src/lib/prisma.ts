import { PrismaClient } from '@prisma/client';

// In un ambiente di produzione, è buona norma creare una singola istanza di PrismaClient
// e riutilizzarla in tutta l'applicazione. In sviluppo, l'oggetto globale non è
// influenzato dall'hot-reloading, quindi possiamo memorizzare il client lì per evitare
// di creare troppe connessioni al database.

declare global {
  // Permette dichiarazioni var globali
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // Opzionale: registra tutte le query eseguite da Prisma. Utile per il debug.
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;