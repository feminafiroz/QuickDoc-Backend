import { Application } from "express";
import userRoutes from "./userRoute";
import doctorRoutes from "./doctorRoute"
import adminRoutes from './adminRoute'
import refreshTokenRoute from './refreshTokenRoute'

const routes = (app: Application) => {
    app.use("/api/user", userRoutes());
    app.use("/api/token", refreshTokenRoute());
    app.use("/api/doctor",doctorRoutes());
    app.use('/api/admin',adminRoutes())
   

};

export default routes;