import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../types/httpStatus";
import { AuthServiceInterfaceType } from "../app/service-interface/authServiceInterface";
import { AuthService } from "../frameworks/services/authService";
import jwt, { JwtPayload } from "jsonwebtoken";
import configKeys from "../config";
import { userDbInterface } from "../app/interfaces/userDbRepository";
import { userRepositoryMongodbType } from "../frameworks/database/repositories/userRepositoryMongodb";
import { doctorDbInterface } from "../app/interfaces/doctorDBRepository";
import { doctorRepositoryMongodbType } from "../frameworks/database/repositories/doctorRepositoryMongodb";
import { getUserById } from "../app/use-cases/user/auth/userAuth";
import { getDoctorById } from "../app/use-cases/Doctor/authDoctor";

const tokenContoller = (
  authServiceInterface: AuthServiceInterfaceType,
  authServiceImpl: AuthService,
  userDbRepository: userDbInterface,
  userDbRepositoryImpl: userRepositoryMongodbType,
  doctorDbRepository: doctorDbInterface,
  doctorDbRepositoryImpl: doctorRepositoryMongodbType
) => {
  const authService = authServiceInterface(authServiceImpl());
  const dbRepositoryUser = userDbRepository(userDbRepositoryImpl());
  const dbRepositoryDoctor = doctorDbRepository(
    doctorDbRepositoryImpl()
  );


  /**
   ** method : POST
   */
  // refresh access token
  const getNewAccessToken = (req: Request, res: Response) => {
    console.log("inside the refresh token controller.......................................")
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, error: "Invalid refresh token" });
    }
    // verify the recieved refresh token and create new access token
    jwt.verify(
      refresh_token,
      configKeys.REFRESH_SECRET,
      (err: any, user: any) => {
        if (err) {
          return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message: "Refresh token is expired" });
        } else {
            console.log(user, "Decoded User from Refresh Token");
          const { id, name, role } = user;
          const  { accessToken }  = authService.createTokens(id, name, role);
          res.status(HttpStatus.OK).json({
            success: true,
            message: "Token refreshed successfully",
            access_token: accessToken,
          });
        }
      }
    );
  };




  /*
   * METHOD:GET,
   * Return acces token to client
   */

  const returnAccessToClient = async (req: Request, res: Response) => {
    try {
    console.log("inside the access token controller.......................................")

    const { access_token } = req.query as { access_token: string };
    if (!access_token)
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Access token is required" });

    const token: JwtPayload = jwt.decode(access_token) as JwtPayload;

      if (token?.role  === "user") {
        const user = await getUserById(token.id, dbRepositoryUser);
        return res
          .status(HttpStatus.OK)
          .json({ success: true, access_token, user });
      }
       else if (token?.role === "doctor") {
        const doc = await getDoctorById(
          token.id,
          dbRepositoryDoctor
        );
        return res
          .status(HttpStatus.OK)
          .json({ success: true, access_token, user: doc });
      }

      return res.status(HttpStatus.OK).json({ success: true, access_token });

    } 
    catch (error) {
    console.error("Error in token controller:", error);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
    }
  };



  return { returnAccessToClient ,  getNewAccessToken};
};

export default tokenContoller;
