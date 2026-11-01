import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const uri = process.env.MONGO_URI;
        if(!uri) throw new Error("MONGO_URI is no defined");
        const conn = await mongoose.connect(uri);
        console.log(`MongoDb connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("MongoDb connection eror:", err.message);
        process.exit(1);
    }
    };
