import moongoose from "mongoose";
import configKeys from "../../config";

const connectDB = async () =>{
    try{
        await moongoose.connect(configKeys.MONGO_DB_URL);
        console.log("Database connected successfully");
    }catch(error){
        console.log("error connecting database:"+error);
        process.exit(1);
    }
};

export default connectDB;