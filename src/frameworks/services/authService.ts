import bcrypt from "bcrypt";
import configKeys from "../../config";
import jwt from "jsonwebtoken";


//hashing password
export const authService = () =>{
    const encryptPassword = async (password:string)=>{
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password,salt);
    };

    //compare password of input and db
    const comparePassword = async(inputPassword: string, password: string)=>{
        return await bcrypt.compare(inputPassword,password);
    }

    const getRandomString = () => crypto.randomUUID();

    //generate otp
    const generateOTP = () =>{
        const otp = Math.floor(100000 + Math.random() * 900000)
        console.log(`otp is :${otp}`)
        return `${otp}`;
    }

    //create access token for users
    const createTokens = (id: string, name: string, role:string)=>{
        const payload = {
            id,
            name,
            role,
        };
        const accessToken = jwt.sign(payload, configKeys.ACCESS_SECRET, {
            expiresIn: "20s",
          });
          const refreshToken = jwt.sign(payload, configKeys.REFRESH_SECRET, {
            expiresIn: "2d",
          });
        
          console.log('Access Token:', accessToken); // Log the generated access token
          console.log('Refresh Token:', refreshToken);
          
        return {accessToken,refreshToken};
    }

    // create token for doctor 
    const doctorCreateTokens = (id:string,name:string, role:string)=>{
        const payload = {
            id,
            name,
            role,
        };
        const accessToken = jwt.sign(payload, configKeys.ACCESS_SECRET, {
            expiresIn: "20s",
          });
          const refreshToken = jwt.sign(payload, configKeys.REFRESH_SECRET, {
            expiresIn: "2d",
          });
          console.log('Access Token:', accessToken); // Log the generated access token
          console.log('Refresh Token:', refreshToken);
        
        return {accessToken,refreshToken};
    }

    return{encryptPassword,generateOTP,comparePassword,createTokens,getRandomString,doctorCreateTokens};
}

export type AuthService = typeof authService;
export type AuthserviceReturn = ReturnType<AuthService>;