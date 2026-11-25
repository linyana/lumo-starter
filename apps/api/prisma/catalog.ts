import { config } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { syncAuthorizationCatalog } from '../src/modules/authorization/catalog/index.js';

config({ path: '../../.env' });
config({ path: '.env', override: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set — copy .env.example to .env first');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

await syncAuthorizationCatalog({ db: prisma });
console.log('permission catalog and system roles are in step with the code');

await prisma.$disconnect();
