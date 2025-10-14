import MenuCards from './MenuCards';
import mysql from 'mysql2/promise';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';

// Definiamo i tipi necessari
interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

interface Category {
  name: string;
  menuItems: Service[];
}

// La funzione di recupero dati rimane quasi la stessa
async function getMenu(): Promise<Service[]> {
  noStore();

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT 
        mi.id, 
        mi.name, 
        mi.description, 
        mi.price, 
        mc.name as category 
     FROM menu_items mi
     JOIN menu_categories mc ON mi.category_id = mc.id`
  );

  await connection.end();

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
  }));
}

export default async function MenuPage() {
  // Recuperiamo i servizi
  const menuServices = await getMenu();

  // Raggruppiamo i servizi per categoria
  const groupedMenu = menuServices.reduce((acc, service) => {
    const category = acc.find(c => c.name === service.category);
    if (category) {
      category.menuItems.push(service);
    } else {
      acc.push({
        name: service.category,
        menuItems: [service],
      });
    }
    return acc;
  }, [] as Category[]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-4xl font-extrabold text-center text-gray-800">
            Notre Menu
          </h1>
          <p className="mt-2 text-center text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos services et réservez votre moment de détente.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <MenuCards menu={groupedMenu} />
          </div>
        </section>
      </main>
    </div>
  );
}