import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseConnection } from '../../utils/data';
import { Connection } from 'mysql';

interface CryolipolisiRow {
  id: number;
  prezzo: number;
  numero_zone: number;
  tipo: string;
}

export async function GET(req: NextRequest) {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    
    const rows = await new Promise<CryolipolisiRow[]>((resolve, reject) => {
      conn!.query('SELECT id, prezzo, numero_zone, tipo FROM cryolipolisi', (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results as CryolipolisiRow[]);
      });
    });
    
    const formattedData = rows.map((row) => ({
      id: row.id.toString(),
      price: row.prezzo,
      title: `Cryolipolisi ${row.numero_zone} Zone (${row.tipo === 'a seance' ? 'Séance' : 'Forfait'})`,
      description: `${row.tipo === 'a seance' ? '1 séance' : 'Forfait'} de cryolipolyse pour ${row.numero_zone} zone(s).`
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch cryolipolisi data:', error);
    return NextResponse.json({ message: 'Failed to fetch cryolipolisi data' }, { status: 500 });
  } finally {
    if (conn) {
      conn.end();
    }
  }
}