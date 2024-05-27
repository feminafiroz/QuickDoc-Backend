import { Request, Response, NextFunction } from "express";
import asynchandler from "express-async-handler";
import {
  AuthServiceInterfaceType,
  authServiceInterface,
} from "../app/service-interface/authServiceInterface";
import { AuthService } from "../frameworks/services/authService";
import { HttpStatus } from "../types/httpStatus";
import { doctorDbInterface } from "../app/interfaces/doctorDBRepository";
import { doctorRepositoryMongodbType } from "../frameworks/database/repositories/doctorRepositoryMongodb";
import {
  addNewDoctor,
  verifyAccount,
  doctorLogin,
  authenticateGoogleSignInDoctor,
} from "../app/use-cases/Doctor/authDoctor";
import {
  getDoctorProfile,
  updateDoctor,
} from "../app/use-cases/Doctor/ReadnUpdate/Profile";
import { log } from "console";
import { GoogleResponseDoctorType } from "../types/GoogleResponseType";
import { IDepartmentRepository } from "../app/interfaces/departmentRepositoryInterface";
import { listDepartments } from "../app/use-cases/Admin/adminDepartment";

const doctorController = (
  authServiceInterface: AuthServiceInterfaceType,
  authServiceImpl: AuthService,
  doctorDbRepository: doctorDbInterface,
  doctorDbRepositoryImpl: doctorRepositoryMongodbType,
  departmentDbRepository: IDepartmentRepository,
  departmentDbRepositoryImpl: () => any
) => {
  const authService = authServiceInterface(authServiceImpl());
  const dbRepositoryDoctor = doctorDbRepository(doctorDbRepositoryImpl());
  const dbDepartmentRepository = departmentDbRepository(
    departmentDbRepositoryImpl()
  );

  //doctor signup - post
  const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("inside the controller success");
      const doctordata = req.body;
      const registerDoctor = await addNewDoctor(
        doctordata,
        dbRepositoryDoctor,
        authService
      );
      if (registerDoctor) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message:
            "Registration success, please verify your email that we sent to your mail",
        });
      }
    } catch (error) {
      console.log("inside the controller failed");
      next(error);
    }
  };

  //verify ac - post
  const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.params;
      const verifying = await verifyAccount(token, dbRepositoryDoctor);
      if (verifying) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: "Account is verified ,go n login",
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // doctor login - post
  const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Assuming doctorLogin, dbRepositoryDoctor, and authService are defined elsewhere
      const { accessToken,refreshToken, isEmailExist } = await doctorLogin(
        email,
        password,
        dbRepositoryDoctor,
        authService
      );
      // console.log("accesstoken -", accessToken);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Login successful",
        doctor: isEmailExist,
        access_token: accessToken,
        refresh_token : refreshToken ,
      });
    } catch (error) {
      next(error);
    }
  };

  //google authen - post
  const googleSignIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const doctorData: GoogleResponseDoctorType = req.body.doctor;

      const { accessToken,refreshToken, isEmailExist, createdUser } =
        await authenticateGoogleSignInDoctor(
          doctorData,
          dbRepositoryDoctor,
          authService
        );

      const user = isEmailExist ? isEmailExist : createdUser;
      res
        .status(HttpStatus.OK)
        .json({ message: "login success",
         user,
        access_token: accessToken,
        refresh_token : refreshToken  });
    } catch (error) {
      next(error);
    }
  };

  //doctor profile - get
  const doctorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      
      const doctorId = req.doctor;
      console.log(doctorId,"ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");
      

      const doctor = await getDoctorProfile(doctorId, dbRepositoryDoctor);
      console.log(doctor," molusee ivde noku ... ");
      console.log(doctor?.department);
      res.status(200).json({ success: true, doctor });
    } catch (error) {
      next(error);
    }
  };

  //update doctor profile -patch
  const updateDoctorInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const doctorId = req.doctor;
      const updateData = req.body;
      console.log("inside doctor profile editing controller")

      const doctor = await updateDoctor(
        doctorId,
        updateData,
        dbRepositoryDoctor
      );
      res
        .status(200)
        .json({ success: true, doctor, message: "KYC updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  //retrieve doctor status - get
  const doctorStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const doctorId = req.doctor;
      const doctor = await getDoctorProfile(doctorId, dbRepositoryDoctor);
      res.status(200).json({ success: true, doctor });
    } catch (error) {
      next(error);
    }
  };

  // list department - get
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
    signup,
    verifyToken,
    googleSignIn,
    login,
    doctorProfile,
    updateDoctorInfo,
    doctorStatus,
    listDepartmentsHandler,
  };
};

export default doctorController;
