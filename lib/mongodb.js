import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  // If no MongoDB URI provided, use in-memory server for development
  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not found in .env.local");
    console.log("Using in-memory MongoDB for development...");
    return await connectToMemoryDB();
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    };

    console.log("🔄 Attempting to connect to MongoDB Atlas...");
    console.log("Database:", MONGODB_URI.split('/').pop().split('?')[0]);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB Atlas Connected Successfully!");
        console.log("Connected to:", mongoose.connection.name);
        return mongoose;
      })
      .catch(async (error) => {
        console.error("❌ MongoDB Atlas Connection Failed!");
        console.error("Error:", error.message);
        
        console.log("\n🔧 Falling back to in-memory MongoDB for development...");
        console.log("To fix Atlas connection:");
        console.log("1. Check .env.local for correct MONGODB_URI");
        console.log("2. Whitelist your IP in MongoDB Atlas");
        console.log("3. Use standard connection string if SRV fails");
        
        // Fall back to in-memory database
        return await connectToMemoryDB();
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

async function connectToMemoryDB() {
  try {
    console.log("🚀 Starting in-memory MongoDB server...");
    
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log("📊 In-memory MongoDB running at:", uri);
    
    const opts = {
      bufferCommands: false,
    };
    
    const mongooseInstance = await mongoose.connect(uri, opts);
    
    // Create a test user for development
    await createTestUser(mongooseInstance);
    
    console.log("✅ In-memory MongoDB ready for development");
    return mongooseInstance;
  } catch (error) {
    console.error("❌ Failed to start in-memory MongoDB:", error);
    throw error;
  }
}

async function createTestUser(mongooseInstance) {
  try {
    const User = mongooseInstance.model('User') || 
                 (await import('../models/User')).default;
    
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'luxurybyozi@gmail.com' });
    
    if (!existingUser) {
      await User.create({
        name: 'Test User',
        email: 'luxurybyozi@gmail.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("👤 Created test user: luxurybyozi@gmail.com / password123");
    }
  } catch (error) {
    console.log("Note: Could not create test user:", error.message);
  }
}