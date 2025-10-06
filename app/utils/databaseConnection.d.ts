export function createDatabaseConnection(): Promise<Connection>;

declare module './databaseConnection.d.ts' {
  export function createDatabaseConnection(): Promise<Connection>;
}