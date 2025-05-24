import mongoose from "mongoose";

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.ATLAS_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=AtlasCluster`;

if (!MONGODB_URI) {
    console.log("MongoDB URI is missing");
    throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
    console.log("Creating new mongoose cache");
    cached = global.mongoose = {conn: null, promise: null};
}

export async function connectDB() {
    if (cached.conn) {
        console.log(`Connected to DB: ${cached.conn}`);
        return cached.conn;
    }

    if (!cached.promise) {
        console.log(`Connecting to DB: ${MONGODB_URI}`);
        cached.promise = mongoose.connect(MONGODB_URI, {
            maxConnecting: 1,
            maxPoolSize: 1,
            minPoolSize: 1,
        });
    }

    cached.conn = await cached.promise;
    console.log(`Connected to DB: ${cached.conn}`);
    return cached.conn;
}
