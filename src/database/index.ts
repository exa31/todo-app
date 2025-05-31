import mongoose from "mongoose";
import logger from "@/lib/logger";

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}${process.env.ATLAS_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=AtlasCluster`;

if (!MONGODB_URI) {
    logger.info("MongoDB URI is missing");
    throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
    logger.info("Creating new mongoose cache");
    cached = global.mongoose = {conn: null, promise: null};
}

export async function connectDB() {
    try {

        if (cached.conn) {
            logger.info(`Using cached DB connection: ${MONGODB_URI}`);
            return cached.conn;
        }

        if (!cached.promise) {
            logger.info(`Connecting to DB: ${MONGODB_URI}`);
            cached.promise = mongoose.connect(MONGODB_URI, {
                maxConnecting: 1,
                maxPoolSize: 1,
                minPoolSize: 1,
            });
        }

        cached.conn = await cached.promise;
        logger.info(`Connected to DB: ${MONGODB_URI}`);
        return cached.conn;
    } catch (error) {
        logger.error(`Error connecting to the database: ${error}`);
        throw new Error(`Failed to connect to the database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
