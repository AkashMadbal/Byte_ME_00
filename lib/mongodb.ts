import { MongoClient } from 'mongodb';

// This ensures this module only runs on the server side
const isServer = typeof window === 'undefined';

if (!isServer) {
  throw new Error('MongoDB client should only be used on the server side');
}

if (!process.env.DATABASE_URL) {
  throw new Error('Please add your MongoDB connection string to .env');
}

const uri = process.env.DATABASE_URL;
// Add connection options with retry and timeout settings
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000,  // 45 seconds
  // Add retry settings
  maxPoolSize: 10,         // Maximum number of connections in the pool
  minPoolSize: 0,          // Minimum number of connections in the pool
};

let client;
let clientPromise: Promise<MongoClient>;

// Function to handle connection with better error messages
const connectWithRetry = async (uri: string, options: any): Promise<MongoClient> => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = new MongoClient(uri, options);
    await client.connect();
    console.log('Successfully connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);

    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('MongoDB connection refused. Make sure MongoDB is running at:', uri);
        console.error('See MONGODB_SETUP.md for instructions on setting up MongoDB.');
      } else if (error.message.includes('Authentication failed')) {
        console.error('MongoDB authentication failed. Check your username and password in the connection string.');
      } else if (error.message.includes('timed out')) {
        console.error('MongoDB connection timed out. Check your network or firewall settings.');
      }
    }

    throw error;
  }
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = connectWithRetry(uri, options);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = connectWithRetry(uri, options);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
