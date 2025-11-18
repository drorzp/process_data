import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import unzipper from 'unzipper';
import { main } from './app';

dotenv.config();

// Environment configuration
const bucket = process.env.Bucket_NAME as string;
const region = process.env.AWS_REGION || 'us-east-1'; // adjust as needed
const prefix = process.env.S3_PREFIX || ''; // optional, e.g. "incoming/"

if (!bucket) {
  throw new Error('Bucket_NAME env var is required');
}

// S3 client
const s3 = new S3Client({ region });

async function downloadAndUnzipObject(key: string): Promise<void> {
  console.log(`Downloading ${key} from bucket ${bucket}...`);

  const getRes = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

  if (!getRes.Body) {
    console.warn(`No body for object ${key}`);
    return;
  }

  const importedDir = path.join(__dirname, 'imported_files');
  if (!fs.existsSync(importedDir)) {
    fs.mkdirSync(importedDir, { recursive: true });
  }

  // Save ZIP file locally first
  const zipFileName = path.basename(key);
  const localZipPath = path.join(importedDir, zipFileName);
  const bodyStream = getRes.Body as NodeJS.ReadableStream;

  // Download ZIP to local file
  await new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(localZipPath);
    bodyStream.pipe(fileStream)
      .on('finish', () => {
        console.log(`Downloaded ZIP to ${localZipPath}`);
        resolve();
      })
      .on('error', reject);
  });

  // Extract files from the local ZIP
  const writePromises: Promise<void>[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(localZipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        const fileName = path.basename(entry.path);
        const type = entry.type; // 'Directory' or 'File'
        
        // Skip macOS resource fork files and __MACOSX metadata
        if (fileName.startsWith('._') || entry.path.includes('__MACOSX')) {
          entry.autodrain();
          return;
        }
        
        // Skip non-ECLI files (like merge-statistics.json)
        if (type === 'File' && fileName && !fileName.startsWith('ECLI:')) {
          console.log(`  Skipping non-ECLI file: ${fileName}`);
          entry.autodrain();
          return;
        }
        
        if (type === 'File' && fileName) {
          // Write file directly to imported_files (flatten structure)
          const outputPath = path.join(importedDir, fileName);
          
          // Track write completion
          const writePromise = new Promise<void>((resolveWrite, rejectWrite) => {
            const writeStream = fs.createWriteStream(outputPath);
            entry.pipe(writeStream)
              .on('finish', () => {
                console.log(`  Extracted: ${fileName}`);
                resolveWrite();
              })
              .on('error', rejectWrite);
          });
          writePromises.push(writePromise);
        } else {
          // Skip directories
          entry.autodrain();
        }
      })
      .on('close', async () => {
        // Wait for all files to be fully written
        await Promise.all(writePromises);
        console.log(`Unzipped ${key} into ${importedDir} (${writePromises.length} files)`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error unzipping ${key}:`, err);
        reject(err);
      });
  });

  // Delete the local ZIP file after extraction
  fs.unlinkSync(localZipPath);
  console.log(`Deleted local ZIP file: ${localZipPath}`);
}

export async function start(): Promise<void> {
  try {
    console.log('Starting S3 -> imported_files -> main() flow');

    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix || undefined,
      })
    );

    const contents = listRes.Contents || [];
    const zipKeys = contents
      .map((o) => o.Key)
      .filter((k): k is string => !!k && k.endsWith('.zip'));

    if (zipKeys.length === 0) {
      console.log('No ZIP files found in S3');
      return;
    }

    for (const key of zipKeys) {
      try {
        // Download and extract ZIP
        await downloadAndUnzipObject(key);

        // Process the extracted files immediately
        await main();
      } catch (err) {
        console.error(`Failed to download/unzip/process ${key}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in start():', err);
  }
}

// Optional: run start() when this file is executed directly
if (require.main === module) {
  start().catch((err) => {
    console.error('Fatal error in start():', err);
    process.exit(1);
  });
}