import { doctorEntityType, googleSignInUserEntityType } from "../../entities/doctorEntity";
import { doctorRepositoryMongodbType } from "../../frameworks/database/repositories/doctorRepositoryMongodb";
import { DoctorInterface } from "../../types/doctorInterface";

export const doctorDbRepository = (repository:ReturnType<doctorRepositoryMongodbType>) => {

    const getDoctorById = async(id:string)=>       
         await repository.getDoctorById(id);
        
    const getDoctorByEmail = async(email:string) => 
        await repository.getDoctorByEmail(email)
    
    const addDoctor = async(doctorData:doctorEntityType) => 
       await  repository.addDoctor(doctorData)
    
    const verifyDoctor = async(token:string) => 
        await repository.verifyDoctor(token)

    const updateProfile = async (doctorID:string, doctorData : Record<string,any>)=>{
        console.log(doctorData,"doctordbrepooooo")
        return await repository.updateDoctorInfo(doctorID,doctorData);}

    const getAllDoctors =  async () => await repository.getAllDoctors();

    const updateDoctorBlock = async (id:string,status:boolean) => await repository.updateDoctorBlock(id, status);

    const getDoctorByIdUpdate =  async (id: string, action:string) =>{
        
        return await repository.getDoctorByIdUpdate(id,action);

    }

    const getDoctorByIdUpdateRejected = async (id: string, status:string,reason:string) =>await repository.getDoctorByIdUpdateRejected(id,status,reason);


    const registerGoogleSignedDoctor = async (doctor: googleSignInUserEntityType) =>await repository.registerGoogleSignedDoctor(doctor);
    
    return{
        getDoctorById,
        getDoctorByEmail,
        addDoctor,
        verifyDoctor,
        updateProfile,
        getAllDoctors,
        updateDoctorBlock,
        getDoctorByIdUpdate,
        registerGoogleSignedDoctor,
        getDoctorByIdUpdateRejected,
        
    }
}

export type doctorDbInterface = typeof doctorDbRepository