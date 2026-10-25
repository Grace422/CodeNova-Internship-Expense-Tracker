import { MongoClient } from "mongodb";

const CONNECTION_STRING = process.env.DATABASE_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

if (!CONNECTION_STRING) {
    throw new Error("DATABASE_URL is missing from .env.local");
}

if (!DATABASE_NAME) {
    throw new Error("DATABASE_NAME is missing from .env.local");
}

const globalForMongo = globalThis;

if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(CONNECTION_STRING);

    globalForMongo.mongoClientPromise = client.connect();
}

export default async function connectDB() {
    const client = await globalForMongo.mongoClientPromise;
    const database = client.db(DATABASE_NAME);

    return database;
}
