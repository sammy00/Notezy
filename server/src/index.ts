import "dotenv/config";
import app from "./app";
import { connectToMongo } from "./config/db";

const startServer = async () => {
  try {
    await connectToMongo();
    const port = Number(process.env.PORT) || 5050;

    app.listen(port, () => {
      console.log(`Notezy API is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
