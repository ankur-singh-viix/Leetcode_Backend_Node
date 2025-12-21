import mongoose, { mongo } from "mongoose";
import logger from "./logger.config";
import { serverConfig } from ".";

export const connectDB = async ()=> {
    try {
        const dbUrl = serverConfig.DB_URL;
        await mongoose.connect(dbUrl || 'mongodb://localhost:27017/LC_ProblemService');
        logger.info(`MongoDB Connected Successfully: ${dbUrl}`);

        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err}`);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');    
            setTimeout(() => {
                mongoose.connect(dbUrl || 'mongodb://localhost:27017/LC_ProblemService').catch(() => {});   
            });
        });
    }
    catch (error) {
        logger.error("Error connecting to the database", error);
        process.exit(1);
    }
}