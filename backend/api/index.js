import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import app from "../server.js";

dotenv.config();

// Ensure Prisma is connected (cached across warm starts)
const prisma = new PrismaClient();

const handler = async (req, res) => {
    return app(req, res);
};

export default handler;