import { HttpStatus } from "../types/httpStatus";
import { loginAdmin } from "../app/use-cases/Admin/adminAuth";
import { Request, Response, NextFunction } from "express";
import { AuthServiceInterfaceType } from "../app/service-interface/authServiceInterface";
import { AuthService } from "../frameworks/services/authService";
import { userDbInterface } from "../app/interfaces/userDbRepository";
import { userRepositoryMongodbType } from "../frameworks/database/repositories/userRepositoryMongodb";
import { doctorRepositoryMongodbType } from "../frameworks/database/repositories/doctorRepositoryMongodb";
import { doctorDbInterface } from "../app/interfaces/doctorDBRepository";
import {
  getUsers,
  getDoctors,
  getSingleDoctor,
  getDoctor,
  getDoctorRejected,
} from "../app/use-cases/Admin/adminRead";
import { blockDoctor, blockUser } from "../app/use-cases/Admin/adminUpdate";
import {
  addDepartment,
  blockDepartment,
  getAllDepartments,
  listDepartments,
  unblockDepartment,
  unlistDepartments,
  updateDepartment,
} from "../app/use-cases/Admin/adminDepartment";
import { IDepartmentRepository } from "../app/interfaces/departmentRepositoryInterface";

export default (
  authServiceInterface: AuthServiceInterfaceType,
  authServiceImpl: AuthService,
  userDbRepository: userDbInterface,
  userDbRepositoryImpl: userRepositoryMongodbType,
  doctorDbRepository: doctorDbInterface,
  doctorDbRepositoryImpl: doctorRepositoryMongodbType,
  departmentDbRepository: IDepartmentRepository,
  departmentDbRepositoryImpl: () => any
) => {
  const dbUserRepository = userDbRepository(userDbRepositoryImpl());
  const dbDoctorRepository = doctorDbRepository(doctorDbRepositoryImpl());
  const authService = authServiceInterface(authServiceImpl());
  const dbDepartmentRepository = departmentDbRepository(
    departmentDbRepositoryImpl()
  );

  const adminLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await loginAdmin(email, password, authService);
      console.log("inside the controller",accessToken)
      console.log("inside the controller",refreshToken)

      
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Admin login success",
        admin: { name: "Admin user", role: "admin" },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      next(error);
    }
  };

  //get : all user
  const getAllUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await getUsers(dbUserRepository);
      return res.status(HttpStatus.OK).json({ success: true, users });
    } catch (error) {
      next(error);
    }
  };

  //get : all doctor
  const getAllDoctors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const doctors = await getDoctors(dbDoctorRepository);
      return res.status(HttpStatus.OK).json({ success: true, doctors });
    } catch (error) {
      next(error);
    }
  };

  //patch : block/unblock users
  const userBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedUser = await blockUser(id, dbUserRepository);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "User block status updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  //patch : block/unblock doctors
  const doctorBlock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const updatedDoctor = await blockDoctor(id, dbDoctorRepository);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: "doctor block status updated successfully",
        doctor: updatedDoctor,
      });
    } catch (error) {
      next(error);
    }
  };

  //get : doctor details
  const doctorDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const doctor = await getSingleDoctor(id, dbDoctorRepository);
      return res.status(HttpStatus.OK).json({ success: true, doctor });
    } catch (error) {
      next(error);
    }
  };

  //patch : updateDoctor (admin has to verify this doctor is real or not )
  const updateDoctor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      console.log("inside controller", action);
      const doctor = await getDoctor(id, action, dbDoctorRepository);
      console.log(doctor);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, doctor, message: "Verified Successfull" });
    } catch (error) {
      next(error);
    }
  };

  // patch : rejection in admin
  const rejectionDoctor = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { reason } = req.body;
      const doctor = await getDoctorRejected(
        id,
        status,
        reason,
        dbDoctorRepository
      );
      return res
        .status(HttpStatus.OK)
        .json({ success: true, doctor, message: "Verified Successfully" });
    } catch (error) {
      next(error);
    }
  };

  // Department management handlers

    //post : adds a new department.
  const addDepartmentHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { departmentName } = req.body;
      const newDept =  await addDepartment({departmentName}, dbDepartmentRepository);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Department added successfully",newDept});
    } catch (error) {
      next(error);
    }
  };

  //get : gets all departments.(islisted true as well as false )
  const getAllDepartmentsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const departments = await getAllDepartments(dbDepartmentRepository);
      return res.status(HttpStatus.OK).json({ success: true, departments });
    } catch (error) {
      next(error);
    }
  };

  //post :updates a department by ID.
  const updateDepartmentHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const departmentName = req.body;
      await updateDepartment(id, departmentName, dbDepartmentRepository);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Department updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  //patch:  blocks a department by ID.
  const blockDepartmentHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("vanaloo njn ivdaaa :-)")
      const { id } = req.params;
      await blockDepartment(id, dbDepartmentRepository);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Department blocked successfully" });
    } catch (error) {
      next(error);
    }
  };

  //patch: unblocks a department by ID.
  const unblockDepartmentHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await unblockDepartment(id, dbDepartmentRepository);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Department unblocked successfully" });
    } catch (error) {
      next(error);
    }
  };

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

  // get:  unlists a department by ID.
  const unlistDepartmentsHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const departments = await unlistDepartments(dbDepartmentRepository);
      return res.status(HttpStatus.OK).json({ success: true, departments });
    } catch (error) {
      next(error);
    }
  };

  return {
    adminLogin,
    getAllUser,
    getAllDoctors,
    userBlock,
    doctorBlock,
    doctorDetails,
    updateDoctor,
    rejectionDoctor,
    addDepartmentHandler,
    getAllDepartmentsHandler,
    updateDepartmentHandler,
    blockDepartmentHandler,
    unblockDepartmentHandler,
    listDepartmentsHandler,
    unlistDepartmentsHandler,
  };
};
