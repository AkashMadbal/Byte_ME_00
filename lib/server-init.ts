import { initUserCollection } from './models/user';

// This file will be imported by server components and API routes
// to ensure the database is initialized

let initialized = false;

export async function initServerDatabase() {
  // Only initialize once
  if (initialized) return;

  try {
    console.log('Initializing MongoDB collections...');
    // Check if MongoDB is running
    try {
      const clientPromise = await import('./mongodb').then(mod => mod.default);
      const client = await clientPromise;
      const adminDb = client.db().admin();
      const result = await adminDb.ping();
      console.log('MongoDB server is running:', result);
    } catch (dbError) {
      console.error('MongoDB connection test failed:', dbError);
      throw new Error(`MongoDB connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }

    await initUserCollection();
    initialized = true;
    console.log('MongoDB collections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MongoDB collections:', error);
    // Don't set initialized to true if there was an error
    // Rethrow the error to make it visible in the API response
    throw error;
  }
}

// Call initialization immediately when this module is imported
initServerDatabase();
