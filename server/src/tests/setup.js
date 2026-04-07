import mongoose from "mongoose";

export const setupTestDatabase = async () => {
  process.env.MONGO_URI =
    process.env.TEST_MONGO_URI || "mongodb://localhost:27017/home-services-test";
  process.env.JWT_SECRET = "test-secret";
  process.env.CLIENT_URL = "http://localhost:5173";
  await mongoose.connect(process.env.MONGO_URI);
};

export const teardownTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

export const clearTestDatabase = async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};
