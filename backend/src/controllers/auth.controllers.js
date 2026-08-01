import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { db } from "../libs/db.js";
import { error } from "node:console";
import { UserRole } from "../generated/prisma/index.js";

dotenv.config();



export const register = async(req, res) => {
    const { email, password, name } = req.body;

    try {
        const existingUser = await db.user.findUnique({
            where : {
                email
            }
        });

        if(existingUser){
            return res.status(400).json({
                error: "user already exists",
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER,
            }
        });

        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        res.status(201).json({
            success: true,
            message: "user created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image, // this is for future implementation 
            }
        });

    } catch (error) {
        console.error("error creating user : ", error);
        res.status(500).json({
            error: "error creating user",
        });
    }

};

export const login = async(req, res) => {
    const { email, password } = req.body;

    try {
        
        const user = await db.user.findUnique({
            where: {
                email,
            }
        });

        if(!user){
            return res.status(401).json({
                error: "user not found",
            });
        };

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({
                error: "invalid credentials",
            });
        };

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        res.status(200).json({
            success: true,
            message: "user loggedIn successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image,
            }
        });

    } catch (error) {
        console.error("error loggingIn user : ", error);
        res.status(500).json({
            error: "error loggingIn user",
        });
    }
}; 

export const logout = async(req, res) => {
    try {
        
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        });

        res.status(200).json({
            success: true,
            message: "user logged Out successfully",
        });

    } catch (error) {
        console.error("error logging Out user : ", error);
        res.status(500).json({
            error: "error logging out user",
        });
    }
};

export const check = async(req, res) => {
    try {
        
        res.status(200).json({
            success: true,
            message: "user authenticated successfully",
        });

    } catch (error) {
        
    }
};