import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const globalWithMongoose = global;
globalWithMongoose.mongoose = globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectMongoDB() {
  return connectDB();
}

async function connectDB() {
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB Connected Successfully! ');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB Connection Failed:', error.message);
        throw error;
      });
  }

  try {
    globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
  } catch (e) {
    globalWithMongoose.mongoose.promise = null;
    throw e;
  }

  return globalWithMongoose.mongoose.conn;
}

export default connectDB;
