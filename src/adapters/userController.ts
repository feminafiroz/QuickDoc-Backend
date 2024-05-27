import { NextFunction,Request,Response } from "express";
import asynchandler from "express-async-handler";
import { 
    userRegister,
    verifyOtpUser,
    login,
    deleteOtp,
    sendResetVerificationCode,
    verifyTokenAndRestPassword,
    authenticateGoogleSignInUser,
} from "../app/use-cases/user/auth/userAuth";
import { userDbInterface } from "../app/interfaces/userDbRepository";
import { userRepositoryMongodbType } from "../frameworks/database/repositories/userRepositoryMongodb";
import { AuthService } from "../frameworks/services/authService";
import { AuthServiceInterfaceType} from "../app/service-interface/authServiceInterface";
import { HttpStatus } from "../types/httpStatus"; 
import {getDoctors,getSingleDoctor} from '../app/use-cases/Admin/adminRead'
import {doctorDbInterface} from '../app/interfaces/doctorDBRepository'
import {doctorRepositoryMongodbType} from '../frameworks/database/repositories/doctorRepositoryMongodb'
import { GoogleResponseType } from "../types/GoogleResponseType";
import { listDepartments } from "../app/use-cases/Admin/adminDepartment";
import { IDepartmentRepository } from "../app/interfaces/departmentRepositoryInterface";



const userController =(
    authServiceInterface: AuthServiceInterfaceType,
    authServiceImpl:AuthService,
    userDbRepository: userDbInterface,
   userRepositoryImpl: userRepositoryMongodbType,
   doctorDbRepository: doctorDbInterface,
   doctorDbRepositoryImpl: doctorRepositoryMongodbType,
   departmentDbRepository: IDepartmentRepository,
   departmentDbRepositoryImpl: () => any
) => {
    const dbRepositoryUser = userDbRepository(userRepositoryImpl());
    const authService = authServiceInterface(authServiceImpl());
    const dbDoctorRepository = doctorDbRepository(doctorDbRepositoryImpl());
    const dbDepartmentRepository = departmentDbRepository(
      departmentDbRepositoryImpl()
    );

    
    // Register User POST - Method
    const registerUser = async( req:Request,res:Response,next:NextFunction ) =>{
        try{
            const user = req.body;
            const newUser =   await userRegister(user,dbRepositoryUser,authService);
            res.json({
               message: "User registration successful,please verify your email",
               newUser,
            });
           } catch (error) {
            next(error);
        }
    }

// Verify Otp Method POSt
    const verifyOtp = async (req: Request, res: Response,next:NextFunction)=>{
        try{
            const {otp,userId} = req.body;
            const isVerified = await verifyOtpUser(otp,userId,dbRepositoryUser);
            if(isVerified){
                return res.status(HttpStatus.OK)
                .json({message:"User account verified, please login"});
            }
        }catch(error){
            next(error);
        }
    }

     //Resend Otp method : POST
     const resendOtp = async (req:Request,res:Response,next:NextFunction)=>{
        try{
            const {userId} = req.body;
            await deleteOtp(userId,dbRepositoryUser,authService);
            res.json({message:"New otp sent to mail"});
        }catch(error){
            next(error);
        }
    };

    // user login method: Post
    const userLogin = asynchandler(
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const { accessToken,refreshToken, isEmailExist } = await login(
              req.body,
              dbRepositoryUser,
              authService
            );
            
            res
            .status(HttpStatus.OK)
            .json({ message: "login success", user: isEmailExist ,
            access_token: accessToken,
            refresh_token : refreshToken ,
            });
        } catch (error) {
          next(error);
        }
      }
      ); 

      //user forgot password : post
      const forgotPassword = async (req:Request,res:Response,next :NextFunction)=> {
        try {
            
            const {email} = req.body;
            console.log(email);
            await sendResetVerificationCode(email,dbRepositoryUser,authService);

            return res.status(HttpStatus.OK).json({
                success:true,
                message : "Reset password is send to your email,check it"
            })
            
        } catch (error) {
           
            next(error)
        }
      }

      //user reset password : post
      const resetPassword = async(req:Request,res:Response,next :NextFunction) => {
        try {
            console.log('aaaaaaaaa')
            const {password} = req.body;
            const {token} = req.params;
            await verifyTokenAndRestPassword(token,password,dbRepositoryUser,authService)
            return res.status(HttpStatus.OK).json({
                success:true,
                message: "Reset password success,you can login with your new password",
            })
            
        } catch (error) {
            console.log('zzzzzzzzz')
            next (error)
        }
      }

      //google sign : post
      const googleSignIn = async (
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        try {
          const userData: GoogleResponseType= req.body.user;
          const { accessToken,refreshToken, isEmailExist, createdUser } =
            await authenticateGoogleSignInUser(
              userData,
              dbRepositoryUser,
              authService
            );
          const user = isEmailExist ? isEmailExist : createdUser;//isEmailExist is truthy (an existing user is found), user is set to isEmailExist.Otherwise, user is set to createdUser (the newly created user).
          res.status(HttpStatus.OK).json({ message: "login success", user , access_token: accessToken,refresh_token:refreshToken});
        } catch (error) {
          next(error);
        }
      };

      

      //retrieve all doctors from db : get 
      const doctorPage = async(re:Request,res:Response,next:NextFunction) => {
        try {
            const doctors = await getDoctors(dbDoctorRepository);
            return res.status(HttpStatus.OK).json({success:true,doctors})
        } catch (error) {
            next(error)
        }
      }

      //doctor details : get
      const doctorDetails = async(req:Request,res:Response,next:NextFunction)=>{
        try {
            const {id} = req.params;
            const doctor = await getSingleDoctor(id,dbDoctorRepository);
            return res.status(HttpStatus.OK).json({success:true, doctor})
            
        } catch (error) {
            next(error)
        }
      }
        // get : lists a department by ID.
  const listDepartmentsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const departments = await listDepartments(dbDepartmentRepository);
      return res.status(HttpStatus.OK).json({ success: true, departments });
    } catch (error) {
      next(error);
    }
  };


    return {
        registerUser,
        verifyOtp,
        userLogin,
        resendOtp,
        forgotPassword,
        resetPassword,
        googleSignIn,
        doctorPage,
        doctorDetails,
        listDepartmentsHandler
    };
}

export default userController