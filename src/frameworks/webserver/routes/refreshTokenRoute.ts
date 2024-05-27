
import express from "express";
import { authServiceInterface } from "../../../app/service-interface/authServiceInterface";
import { authService } from "../../services/authService";
import tokenController from "../../../adapters/tokenController";
import { userRepositoryMongodb } from "../../database/repositories/userRepositoryMongodb";
import { userDbRepository } from "../../../app/interfaces/userDbRepository";
import { doctorDbRepository } from "../../../app/interfaces/doctorDBRepository";
import { doctorRepositoryMongodb } from "../../database/repositories/doctorRepositoryMongodb";

const refreshTokenRoute = () => {
  const router = express.Router();
  const controller = tokenController(
    authServiceInterface,
    authService,
    userDbRepository,
    userRepositoryMongodb,
    doctorDbRepository,
    doctorRepositoryMongodb
  );

  router.get("/accessToken", controller.returnAccessToClient);
  router.post("/refresh_token", controller.getNewAccessToken);

  return router;
};
export default refreshTokenRoute;