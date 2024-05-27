
import { doctorEntityType, googleSignInUserEntityType } from "../../../entities/doctorEntity";
import { DoctorInterface } from "../../../types/doctorInterface";
import Doctor from '../models/doctor';
import department from "../models/department";

export const doctorRepositoryMongodb = () => {


    const getDoctorById = async(id:string) => {

       try {
        const doc =  await Doctor.findById(id).populate('department').select(
            "-password -isVerified -isApproved -verificationToken"
        ).exec();
       
        return doc
       } catch (error) {
        console.error(`Error fetching doctor with ID ${id}:`, error);
        throw error;
       }
    }


    const getDoctorByEmail = async(email:string) => {
        const doctor:DoctorInterface | null = await Doctor.findOne({
            email
        })
    return doctor
    }

    const addDoctor = async(doctorData:doctorEntityType) => {
        const newDoctor = new Doctor({
            doctorName:doctorData.getDoctorName(),
            email:doctorData.getEmail(),
            password:doctorData.getPassword(),
            verificationToken:doctorData.getVerificationToken()
        })
        return await newDoctor.save()
    }

    const verifyDoctor = async(token:string) => 
        await Doctor.findOneAndUpdate(
            {verificationToken : token },
            {isVerified:true,verificationToken:null}
        )

    const updateDoctorInfo = async (id: string, updateData:Record<string,any>)=>{
        console.log(updateData,"doctorRepoMongodb")
        console.log(id,"qwertyu")

        const doc = await Doctor.findByIdAndUpdate(id,updateData,{new:true});

        console.log(doc)
        return doc
    }
    
    const getDoctorByIdUpdate = async (id: string,status:string) => {
        console.log(status);
        console.log(status);
        console.log(status);      
        return await Doctor.findByIdAndUpdate(id,{status:status, isApproved:true}).select("-password -isVerified -isApproved -verificationToken");}

    const updateDoctorBlock = async (id: string, status: boolean) =>{
        await Doctor.findByIdAndUpdate(id, { isBlocked: status });
      }
    
    const getAllDoctors = async () => await Doctor.find({ isVerified: true }); 

    const getDoctorByIdUpdateRejected = async (id: string,status:string,reason:string) =>await Doctor.findByIdAndUpdate(id,{status:status, isApproved:false, rejectedReason:reason}).select("-password -isVerified -isApproved -verificationToken");
    
    const registerGoogleSignedDoctor = async (doctor: googleSignInUserEntityType) =>
        await Doctor.create({
          doctorName: doctor.doctorName(),
          email: doctor.email(),
          profileImage: doctor.picture(),
          isVerified: doctor.email_verified(),
          
        });

    

    return{
        getDoctorById,
        getDoctorByEmail,
        addDoctor,
        verifyDoctor,
        updateDoctorInfo,
        getDoctorByIdUpdate,
        updateDoctorBlock,
        getAllDoctors,
        registerGoogleSignedDoctor,
        getDoctorByIdUpdateRejected

    }  
}

export type doctorRepositoryMongodbType = typeof doctorRepositoryMongodb;