import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env.local");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

export default async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log("MongoDB connected successfully");
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}
