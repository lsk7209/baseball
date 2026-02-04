// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const prismaClientSingleton = () => {
    const connectionString = process.env.TURSO_DATABASE_URL

    // 로컬 파일 DB (fallback) 또는 Turso 연결
    // 주의: driverAdapters 사용 시 url에 libsql:// 프로토콜 필요
    const libsql = createClient({
        url: connectionString || "file:./dev.db",
        authToken: process.env.TURSO_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
