import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local explicitly
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config(); // Fallback to .env
}

async function triggerCron() {
    console.log(`[${new Date().toISOString()}] ⏳ Triggering Local Cron...`);

    const secret = process.env.CRON_SECRET;
    if (!secret) {
        console.error('❌ Error: CRON_SECRET is missing in .env.local');
        return;
    }

    try {
        // 로컬 서버 주소
        const BASE_URL = 'http://127.0.0.1:3000';
        const response = await fetch(`${BASE_URL}/api/cron/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[${new Date().toISOString()}] ✅ Cron Success:`, data);
        } else {
            console.error(`[${new Date().toISOString()}] ❌ Cron Failed:`, data);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Network Error:`, error);
    }
}

// 처음 시작 시 1회 실행
triggerCron();

// 15분마다 실행 (15 * 60 * 1000)
setInterval(triggerCron, 15 * 60 * 1000);

console.log('🚀 Local Cron Simulator Started (Runs every 15 mins)');
