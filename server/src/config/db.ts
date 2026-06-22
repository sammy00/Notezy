import mongoose from "mongoose";
import dns from "node:dns";

const configureAtlasDnsFallback = async (mongoURI: string) => {
  if (!mongoURI.startsWith("mongodb+srv://")) return;

  const hostname = new URL(mongoURI).hostname;
  const srvRecord = `_mongodb._tcp.${hostname}`;

  try {
    await dns.promises.resolveSrv(srvRecord);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (!code || !["ECONNREFUSED", "ETIMEOUT", "ESERVFAIL"].includes(code)) throw error;

    const fallbackServers = process.env.DNS_SERVERS
      ?.split(",")
      .map((server) => server.trim())
      .filter(Boolean) ?? ["8.8.8.8", "1.1.1.1"];

    dns.setServers(fallbackServers);
    await dns.promises.resolveSrv(srvRecord);
    console.warn("System DNS could not resolve MongoDB Atlas; using fallback DNS servers.");
  }
};

export const connectToMongo = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    await configureAtlasDnsFallback(mongoURI);
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
