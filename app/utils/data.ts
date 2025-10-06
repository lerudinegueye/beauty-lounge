import 'server-only';
import mysql, { Connection } from 'mysql';
import { CryolipolisiCard, MenuCard } from './definitions';

interface RowData {
  id: number;
  prezzo: number;
  numero_zone: number;
  tipo: string;
}

interface MenuRowData {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export const createDatabaseConnection = (): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    const connectionConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    console.log('Attempting to connect to database with config:', { ...connectionConfig, password: '****' });

    const connection = mysql.createConnection(connectionConfig);

    connection.connect((error) => {
      if (error) {
        console.error('Database connection failed:', error);
        reject(error);
      } else {
        console.log('Database connection successful.');
        resolve(connection);
      }
    });
  });
};

export async function getCards(): Promise<CryolipolisiCard[]> {
    let conn: Connection | null = null;
    try {
        conn = await createDatabaseConnection();
        
        // The query now selects from the `cryolipolisi` table.
        const sqlQuery = 'SELECT * FROM cryolipolisi';
        console.log(`Executing query: ${sqlQuery}`);

        const rows = await new Promise<RowData[]>((resolve, reject) => {
            conn!.query(sqlQuery, (error, results) => {
                if (error) {
                    console.error('SQL query error:', error);
                    return reject(error);
                }
                console.log(`Query returned ${results.length} rows.`);
                resolve(results as RowData[]);
            });
        });

        // We are now mapping the data from your `cryolipolisi` table
        // to the `CryolipolisiCard` structure that the frontend component expects.
        return rows.map(row => {
            const title = `cryolipolisi - ${row.numero_zone} zone`;
            const description = row.tipo === 'a seance' ? 'Prix à la séance' : 'Forfait 3 sèances';
            
            return {
                id: row.id,
                title: title,
                description: description,
                price: row.prezzo, // Using the 'prezzo' column for the price.
            };
        });
    } catch (error) {
        console.error('An error occurred in getCards:', error);
        return [];
    } finally {
        if (conn) {
            console.log('Closing database connection.');
            conn.end();
        }
    }
}

export async function getMenu(): Promise<MenuCard[]> {
    let conn: Connection | null = null;
    try {
        conn = await createDatabaseConnection();
        
        const sqlQuery = `
            SELECT 
                mi.id, 
                mi.name, 
                mi.description, 
                mi.price, 
                mc.name as category 
            FROM menu_items mi
            JOIN menu_categories mc ON mi.category_id = mc.id
        `;
        console.log(`Executing query: ${sqlQuery}`);

        const rows = await new Promise<MenuRowData[]>((resolve, reject) => {
            conn!.query(sqlQuery, (error, results) => {
                if (error) {
                    console.error('SQL query error:', error);
                    return reject(error);
                }
                console.log(`Query returned ${results.length} rows.`);
                resolve(results as MenuRowData[]);
            });
        });

        return rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                price: row.price,
                category: row.category,
            };
        });
    } catch (error) {
        console.error('An error occurred in getMenu:', error);
        return [];
    } finally {
        if (conn) {
            console.log('Closing database connection.');
            conn.end();
        }
    }
}