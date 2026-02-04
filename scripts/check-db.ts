
import prisma from "@/lib/prisma";

async function main() {
    try {
        const categories = await prisma.category.findMany();
        console.log("Categories:", categories.length);

        const personas = await prisma.persona.findMany();
        console.log("Personas:", personas.length);

        if (categories.length > 0 && personas.length > 0) {
            console.log("✅ DB Check Result: SUCCESS");
        } else {
            console.log("❌ DB Check Result: EMPTY");
        }
    } catch (e) {
        console.error("❌ DB Check Result: ERROR", e);
    }
}

main();
