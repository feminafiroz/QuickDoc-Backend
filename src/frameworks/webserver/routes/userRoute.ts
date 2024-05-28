import express from "express";
import { userDbRepository } from "../../../app/interfaces/userDbRepository";
import { authService } from "../../services/authService";
import { userRepositoryMongodb } from "../../database/repositories/userRepositoryMongodb";
import { authServiceInterface } from "../../../app/service-interface/authServiceInterface";
import userController from "../../../adapters/userController";
import authenticateUser from '../middlewares/authMiddleware'
import { doctorDbRepository } from "../../../app/interfaces/doctorDBRepository";
import { doctorRepositoryMongodb } from "../../database/repositories/doctorRepositoryMongodb";
import { departmentDbRepository } from "../../../app/interfaces/departmentRepositoryInterface";
import { departmentRepositoryMongodb } from "../../database/repositories/departmentRepositoryMongodb";



const userRoutes = () => {
    const router = express.Router();
    const controller = userController(
        authServiceInterface,
        authService,
        userDbRepository,
        userRepositoryMongodb,
        doctorDbRepository,
        doctorRepositoryMongodb,
        departmentDbRepository,
        departmentRepositoryMongodb     
    )

    router.post('/register',controller.registerUser)
    router.post('/verify_otp',controller.verifyOtp)
    router.post("/resend_otp", controller.resendOtp);
    router.post("/login",controller.userLogin)
    router.post("/forgot_password",controller.forgotPassword);
    router.post("/reset_password/:token",controller.resetPassword);
    router.post("/google_signIn", controller.googleSignIn);



    router.get("/doctors", controller.doctorPage)
    router.get("/doctor/:id",controller.doctorDetails)
    router.get('/department/list', controller.listDepartmentsHandler);
    router.get("/profile", authenticateUser, controller.userProfile);
    router.patch("/profile/edit", authenticateUser, controller.updateUserInfo);




    return router
}

export default userRoutes