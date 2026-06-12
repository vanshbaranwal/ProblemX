import express from "express";
import dotenv from "dotenv";

dotenv.config();


const app = express();


app.listen(process.env.PORT, () => {
    console.log("server is running on the port 8080");
})

