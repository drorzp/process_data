import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

interface ProvisionRow {
  id: number;
  name: string;
  parent_act_date: string;
}

export async function mapping(): Promise<void> {
  const client = await pool.connect();
  
  try {
    console.log('Starting mapping process...');
    
    // Query the decision_cited_provisions table
    const provisionsQuery = `
      SELECT 
        id, 
        clean_law_title(parent_act_name) as name,
        parent_act_date
      FROM public.decision_cited_provisions
      WHERE parent_act_date IS NOT NULL  and parent_act_type<>'CODE' AND parent_act_type NOT LIKE 'EU%'
        AND LENGTH(clean_law_title(parent_act_name)) > 0 LIMIT 1000
    `;
    
    const provisionsResult = await client.query<ProvisionRow>(provisionsQuery);
    console.log(`Found ${provisionsResult.rows.length} provisions to process`);
    
    // Prepare results array
    const results: string[] = [];
    results.push('id,document_count'); // Header
    
    // Process each provision
    for (const provision of provisionsResult.rows) {
      const { id, name, parent_act_date } = provision;
      
      // Query documents table for matching count
      const documentsQuery = `
        SELECT COUNT(*) as count
        FROM documents 
        WHERE  TO_DATE(SUBSTRING(dossier_number, 1, 10), 'YYYY-MM-DD') = $1 
          AND title ILIKE '%' || $2 || '%'
      `;
      
      const documentsResult = await client.query(
        documentsQuery, 
        [parent_act_date, `%${name}%`]
      );
      
      const documentCount = documentsResult.rows[0].count;
      
      // Add result to array
      results.push(`${id},${documentCount}`);
      
      // Log progress
      if (provisionsResult.rows.indexOf(provision) % 100 === 0) {
        console.log(`Processed ${provisionsResult.rows.indexOf(provision)} provisions...`);
      }
    }
    
    // Write results to file
    const outputPath = path.join(__dirname, '..', 'results.txt');
    fs.writeFileSync(outputPath, results.join('\n'), 'utf-8');
    
    console.log(`Mapping complete! Results written to: ${outputPath}`);
    console.log(`Total provisions processed: ${provisionsResult.rows.length}`);
    
  } catch (error) {
    console.error('Error during mapping:', error);
    throw error;
  } finally {
    client.release();
  }
}

// If this file is run directly, execute the mapping function
if (require.main === module) {
  mapping()
    .then(() => {
      console.log('Mapping finished successfully');
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Mapping failed:', error);
      pool.end();
      process.exit(1);
    });
}
