import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();


app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("ProblemX🔥 - by VanshBaranwal");
});

app.use("/api/v1/auth", authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`the server is running on the port: ${process.env.PORT}`);
});

