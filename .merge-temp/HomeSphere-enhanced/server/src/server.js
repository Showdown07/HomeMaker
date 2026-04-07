import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import { getPort, getJwtSecret } from "./config/env.js";

dotenv.config();

const port = getPort();
getJwtSecret();

await connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
