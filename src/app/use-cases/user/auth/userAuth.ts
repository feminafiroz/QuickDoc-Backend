import createUserEntity, {googleSignInUserEntity, googleSignInUserEntityType, userEntityType} from "../../../../entities/userEntity";
import { CreateUserInterface,UserInterface } from "../../../../types/userInterface";
import { userDbInterface } from "../../../interfaces/userDbRepository";
import {AuthServiceInterfaceType } from "../../../service-interface/authServiceInterface";
import CustomError from "../../../../utils/customError";
import { HttpStatus } from "../../../../types/httpStatus";
import sentMail from "../../../../utils/sendMail";
import { forgotPasswordEmail,otpEmail } from "../../../../utils/userEmail";
import mongoose from "mongoose";
import { GoogleResponseType } from "../../../../types/GoogleResponseType";


export const userRegister = async (
    user:CreateUserInterface,
    userRepository:ReturnType<userDbInterface>,
    authService:ReturnType<AuthServiceInterfaceType>
)=>{
    const {name,email,phoneNumber,password} = user;
 const authenticationMethod = "password";

    //Check the email is already exist

    const isEmailExist = await userRepository.getUserbyEmail(email);
    if(isEmailExist)
    throw new CustomError("Email already exists",HttpStatus.BAD_REQUEST);

    const hashedPassword: string = await authService.encryptPassword(password);

    const userEntity: userEntityType = createUserEntity(
        name,
        email,
        phoneNumber,
        hashedPassword,
        authenticationMethod,
    );

    //create a new User 
    const createdUser: UserInterface = await userRepository.addUser(userEntity);
    
    const OTP = authService.generateOTP();  //generate otp
    const emailSubject = "Account verification";
    await userRepository.addOTP(OTP, createdUser.id);
    
    sentMail(createdUser.email,emailSubject,otpEmail(OTP, createdUser.name)); //send otp

    return createdUser;

};

//verify otp with db otp 

export const verifyOtpUser = async (
    userOTP: string,
    userId: string,
    userRepository:ReturnType<userDbInterface>
)=>{
    if(!userOTP)
    throw new CustomError("Please provide an OTP",HttpStatus.BAD_REQUEST);

    const otpUser = await userRepository.findOtpUser(userId);
    if (!otpUser)
    throw new CustomError(
      "Invalid otp , try resending the otp",
      HttpStatus.BAD_REQUEST
    );

  if (otpUser.OTP === userOTP) {
    await userRepository.updateProfile(userId, {
      isVerified: true,
    });
    return true;
  } else {
    throw new CustomError("Invalid OTP,try again", HttpStatus.BAD_REQUEST);
  }
};

export const deleteOtp = async (
    userId: string,
    userDbRepository: ReturnType<userDbInterface>,
    authService: ReturnType<AuthServiceInterfaceType>
  ) => {
    const newOtp: string = authService.generateOTP();
    const deleted = await userDbRepository.deleteOtpUser(userId); // delete the existing otp user from db
    if (deleted) {
      await userDbRepository.addOTP(newOtp, userId); // create new otp user
    }
    const user = await userDbRepository.getUserbyId(userId);
    if (user) {
      const emailSubject = "Account verification , New OTP";
      sentMail(user.email, emailSubject, otpEmail(newOtp, user.name)); // Sending otp to the user email
    }
   };

export const login = async(
    user:{email: string; password:string},
    userDbRepository:ReturnType<userDbInterface>,
    authService:ReturnType<AuthServiceInterfaceType>
)=>{
    const {email,password} = user;
    const isEmailExist = await userDbRepository.getUserbyEmail(email);

    if(!isEmailExist){
        throw new CustomError("Email does not existing", HttpStatus.UNAUTHORIZED);
    }

    if(isEmailExist?.authenticationMethod === "google"){
      throw new CustomError("Only login with google",HttpStatus.BAD_REQUEST);
    }

    if(isEmailExist?.isBlocked){
        throw new CustomError("Account is Blocked ",HttpStatus.FORBIDDEN);
    }

    if(!isEmailExist?.isVerified){
        throw new CustomError("your account is not verified",HttpStatus.UNAUTHORIZED);
    }

    if(!isEmailExist.password){
        throw new CustomError("Invalid Credentials",HttpStatus.UNAUTHORIZED);
    }
    
    const isPasswordMatched = await authService.comparePassword(password,isEmailExist?.password);

    if(!isPasswordMatched){
        throw new CustomError("Password is Wrong",HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken } = authService.createTokens(
        isEmailExist.id,
        isEmailExist.name,
        isEmailExist.role
    );

    return {accessToken,isEmailExist,refreshToken};
}

export const authenticateGoogleSignInUser = async (
  userData: GoogleResponseType,
  userDbRepository: ReturnType<userDbInterface>,
  authService: ReturnType<AuthServiceInterfaceType>
) => {
  const { name, email, picture, email_verified } = userData;
  const authenticationMethod = "google";

  const isEmailExist = await userDbRepository.getUserbyEmail(email);
  if (isEmailExist?.isBlocked)
    throw new CustomError(
      "Your account is blocked by administrator",
      HttpStatus.FORBIDDEN
    );

  if (isEmailExist) {
    const  { accessToken, refreshToken }  = authService.createTokens(
      isEmailExist.id,
      isEmailExist.name,
      isEmailExist.role
    );

    return { accessToken,isEmailExist ,refreshToken};
  } else {
    const googleSignInUser: googleSignInUserEntityType = googleSignInUserEntity(
      name,
      email,
      picture,
      email_verified,
      authenticationMethod,
      
    );

    const createdUser = await userDbRepository.registerGoogleSignedUser(
      googleSignInUser
    );
    const userId = createdUser._id as unknown as string;

    const   { accessToken, refreshToken }   = authService.createTokens(
      userId,
      createdUser.name,
      createdUser.role
    );
    return { accessToken, createdUser,refreshToken };
  }
};




export const sendResetVerificationCode = async (
  email: string,
  userDbRepository: ReturnType<userDbInterface>,
  authService: ReturnType<AuthServiceInterfaceType>
) => {
  const isEmailExist = await userDbRepository.getUserbyEmail(email);

  if (!isEmailExist)
    throw new CustomError(`${email} does not exist`, HttpStatus.BAD_REQUEST);

  if (isEmailExist.authenticationMethod === 'google')
    throw new CustomError(`${email} is sign in using google signin method,So it has no password to reset :-)`, HttpStatus.BAD_REQUEST);

  const verificationCode = authService.getRandomString();
  console.log("Verification Code:", verificationCode);

  const isUpdated = await userDbRepository.updateVerificationCode(
    email,
    verificationCode
  );
  console.log("isUpdated:", isUpdated); 
  sentMail(
    email,
    "Reset password",
    forgotPasswordEmail(isEmailExist.name, verificationCode)
  );
};


export const verifyTokenAndRestPassword = async (
  verificationCode: string,
  password: string,
  userDbRepository: ReturnType<userDbInterface>,
  authService: ReturnType<AuthServiceInterfaceType>
) => {
  console.log('bbbbbbbb')
  if (!verificationCode)
    throw new CustomError(
      "Please provide a verification code",
      HttpStatus.BAD_REQUEST
    );
  const hashedPassword = await authService.encryptPassword(password);
  const isPasswordUpdated = await userDbRepository.verifyAndResetPassword(
    verificationCode,
    hashedPassword
  );

  if (!isPasswordUpdated)
    throw new CustomError(
      "Invalid token or token expired",
      HttpStatus.BAD_REQUEST
    );
};



export const getUserById = async (
  id: string,
  userRepository: ReturnType<userDbInterface>
) => await userRepository.getUserbyId(id);