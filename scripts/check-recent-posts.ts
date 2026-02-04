import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

const prisma = new PrismaClient();

async function checkRecentPosts() {
    try {
        const posts = await prisma.post.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                type: true,
                sourceType: true,
                createdAt: true,
                persona: {
                    select: { nickname: true }
                }
            }
        });

        console.log('--- Recent Posts (Top 5) ---');
        if (posts.length === 0) {
            console.log('No posts found.');
        } else {
            posts.forEach(p => {
                console.log(`[${p.createdAt.toLocaleString()}] [${p.type}] ${p.title} (by ${p.persona?.nickname || 'System'})`);
            });
        }
    } catch (e) {
        console.error('Error fetching posts:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecentPosts();
