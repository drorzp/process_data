"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
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
function deleteFile(filePath) {
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
    }
}
// Main async function
async function main() {
    try {
        // Test database connection
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        const importedFilesDir = path_1.default.join(__dirname, 'imported_files');
        // Read all JSON files directly from imported_files (files are flattened)
        const allEntries = fs_1.default.readdirSync(importedFilesDir);
        const jsonFiles = allEntries.filter(fileName => {
            const fullPath = path_1.default.join(importedFilesDir, fileName);
            return fs_1.default.statSync(fullPath).isFile() && fileName.endsWith('.json');
        });
        console.log(`Found ${jsonFiles.length} JSON file(s) to process`);
        for (const fileName of jsonFiles) {
            const sourceFilePath = path_1.default.join(importedFilesDir, fileName);
            try {
                await (0, process_1.processFile)(fileName, pool);
                console.log(fileName);
                // DELETE processed file if flag is enabled
                const shouldDelete = (process.env.DELETE_FILE || 'false').toLowerCase() === 'true';
                if (shouldDelete) {
                    deleteFile(sourceFilePath);
                }
            }
            catch (error) {
                console.error(`Failed to process file ${fileName}:`, error);
                // Copy failed file to errors folder
                const errorsDir = path_1.default.join(__dirname, 'errors');
                // Create errors directory if it doesn't exist
                if (!fs_1.default.existsSync(errorsDir)) {
                    fs_1.default.mkdirSync(errorsDir, { recursive: true });
                }
                const errorFilePath = path_1.default.join(errorsDir, fileName);
                fs_1.default.copyFileSync(sourceFilePath, errorFilePath);
                console.log(`File copied to errors folder: ${errorFilePath}`);
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
//# sourceMappingURL=app.js.map