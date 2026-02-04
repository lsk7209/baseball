import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
// native fetch is used

// Load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
}

async function listModels() {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key) {
        console.log('No API Key');
        return;
    }

    console.log(`Checking models with key: ${key.substring(0, 5)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data: any = await response.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log('Error listing models:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log('Fetch error:', e);
    }
}

listModels();
