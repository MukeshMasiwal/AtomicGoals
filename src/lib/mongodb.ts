import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME ?? "goaltrack";

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: DB_NAME,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      })
      .then((mongooseInstance) => {
        console.log(`[mongodb] Connected to database: ${DB_NAME}`);
        return mongooseInstance;
      })
      .catch((error: unknown) => {
        cache.promise = null;
        const message =
          error instanceof Error ? error.message : "Unknown connection error";
        console.error("[mongodb] Connection failed:", message);
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
