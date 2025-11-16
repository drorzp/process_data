"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const process_1 = require("./process");
// Load environment variables
dotenv_1.default.config();
// Create PostgreSQL connection pool
const pool = new pg_1.Pool({
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
        const importedFilesDir = path_1.default.join(__dirname, 'imported_files');
        // Read all files from the imported_files directory
        const files = fs_1.default.readdirSync(importedFilesDir);
        let flag = true;
        // Loop through each file and process it
        for (const fileName of files) {
            try {
                await (0, process_1.processFile)(fileName, pool);
                console.log(fileName);
            }
            catch (error) {
                console.error(`Failed to process file ${fileName}:`, error);
                // Copy failed file to errors folder
                const sourceFilePath = path_1.default.join(importedFilesDir, fileName);
                const errorsDir = path_1.default.join(__dirname, 'errors');
                // Create errors directory if it doesn't exist
                if (!fs_1.default.existsSync(errorsDir)) {
                    fs_1.default.mkdirSync(errorsDir, { recursive: true });
                }
                const errorFilePath = path_1.default.join(errorsDir, fileName);
                fs_1.default.copyFileSync(sourceFilePath, errorFilePath);
                console.log(`File copied to errors folder: ${errorFilePath}`);
                // Continue to next file
                continue;
            }
        }
        client.release();
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        // Disconnect from database
        await pool.end();
        console.log('Database connection closed');
    }
}
// Run the main function
main();
//# sourceMappingURL=app.js.map