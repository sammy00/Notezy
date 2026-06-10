import mongoose from "mongoose";

export const connectToMongo = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
