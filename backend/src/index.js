import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import { db } from "./libs/db.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("ProblemX🔥 - by VanshBaranwal");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);


async function startServer(){
    try {
        await db.$connect();

        console.log("database connection successful!");

        app.listen(process.env.PORT, () => {
            console.log(`the server is running on the port: ${process.env.PORT}`);
        });

    } catch (error) {
        console.error("database connetion failed: ", error.message);
        process.exit(1);
    }
};

startServer();