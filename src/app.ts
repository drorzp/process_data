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

function deleteFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function deleteAllFilesInDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
}

// Main async function
export async function main() {
  const importedFilesDir = path.join(__dirname, 'imported_files');
  
  try {
    // Test database connection
    const client = await pool.connect();

    // Read all JSON files directly from imported_files (files are flattened)
    const allEntries = fs.readdirSync(importedFilesDir);
    const jsonFiles = allEntries.filter(fileName => {
      const fullPath = path.join(importedFilesDir, fileName);
      return fs.statSync(fullPath).isFile() && fileName.endsWith('.json');
    });


    for (const fileName of jsonFiles) {
      const sourceFilePath = path.join(importedFilesDir, fileName);

      try {
        await processFile(fileName, pool);

        // DELETE processed file if flag is enabled
        const shouldDelete = (process.env.DELETE_FILE || 'false').toLowerCase() === 'true';
        if (shouldDelete) {
          deleteFile(sourceFilePath);
        }
      } catch (error) {
        console.error(`Failed to process file ${fileName}:`, error);
        
        // Copy failed file to errors folder
        const errorsDir = path.join(__dirname, 'errors');
        
        // Create errors directory if it doesn't exist
        if (!fs.existsSync(errorsDir)) {
          fs.mkdirSync(errorsDir, { recursive: true });
        }
        
        const errorFilePath = path.join(errorsDir, fileName);
        fs.copyFileSync(sourceFilePath, errorFilePath);

        // DELETE original file from imported_files if flag is enabled
        const shouldDelete = (process.env.DELETE_FILE || 'false').toLowerCase() === 'true';
        if (shouldDelete) {
          deleteFile(sourceFilePath);
        }
        
        // Continue to next file
        continue;
      }
    }

    client.release();
  } catch (error) {
   console.error('Error:');
  } finally {
    // Clean up all remaining files from imported_files
    const shouldDelete = (process.env.DELETE_FILE || 'false').toLowerCase() === 'true';
    if (shouldDelete) {
      deleteAllFilesInDirectory(importedFilesDir);
    }
    // Disconnect from database
    await pool.end();
    console.log('Database connection closed');
  }
}
