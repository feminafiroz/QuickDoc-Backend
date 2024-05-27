import express from 'express'
import { authServiceInterface } from '../../../app/service-interface/authServiceInterface'
import { authService } from '../../services/authService'
import { doctorDbRepository } from '../../../app/interfaces/doctorDBRepository'
import { doctorRepositoryMongodb,doctorRepositoryMongodbType } from '../../database/repositories/doctorRepositoryMongodb'
import { authenticateDoctor } from '../middlewares/authMiddleware'
import doctorController from '../../../adapters/doctorController'
import { departmentDbRepository } from "../../../app/interfaces/departmentRepositoryInterface";
import { departmentRepositoryMongodb } from "../../database/repositories/departmentRepositoryMongodb";
import { log } from 'console'


const doctorRoutes = () => {
    const router = express.Router();
    const controller = doctorController(
        authServiceInterface,
        authService,
        doctorDbRepository,
        doctorRepositoryMongodb,
        departmentDbRepository,
        departmentRepositoryMongodb

    )
    console.log("in doc rot")
    router.post('/register',controller.signup);
    router.post('/verify-token/:token',controller.verifyToken);
    router.post("/google_signIn", controller.googleSignIn);
    router.post('/login',controller.login);

    router.get("/profile",authenticateDoctor,controller.doctorProfile);
    router.get('/department/list', controller.listDepartmentsHandler);
    router.patch("/profile/edit",authenticateDoctor,controller.updateDoctorInfo);
    router.get("/status",authenticateDoctor,controller.doctorStatus);
    return router
} 

export default doctorRoutes