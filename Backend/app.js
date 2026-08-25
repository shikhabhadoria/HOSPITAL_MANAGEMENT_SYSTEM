import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);
import express, { urlencoded } from "express";
import { config } from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser"; 
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./Routes/messageRoutes.js"
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./Routes/userRouter.js"
import appointmentRouter from "./Routes/appointmentRouter.js"

const app = express();
config({ path: "./config/config.env" });

app.use(
    cors({
        origin:[process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        methods:["GET", "POST", "PUT", "DELETE"],
        credentials:true
    })
)

app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended:true }));

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir: "/tmp/",
    })
)

// Health check: cheap endpoint with no DB access.
// Used by the tests and by the deploy job to confirm the server came back up.
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "server is healthy",
        uptime: process.uptime(),
    });
});

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);


// In tests we never touch a real database, so skip the connection there.
if (process.env.NODE_ENV !== "test") {
    dbConnection();
}

app.use(errorMiddleware)

export default app;

