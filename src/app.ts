import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { processFile } from './process';
// Load environment variables
dotenv.config();

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT || '5433'),
  database: process.env.POSTGRES_DB,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

// Main async function
async function main() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');


    const importedFilesDir = path.join(__dirname, 'imported_files');

    // Read all files from the imported_files directory
    const files = fs.readdirSync(importedFilesDir);
    let flag = true;
    // Loop through each file and process it
    for (const fileName of files) {
    if(flag) {
        await processFile(fileName, pool);
        console.log(fileName)
        flag=false;
    }
    }

    client.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from database
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the main function
main();
