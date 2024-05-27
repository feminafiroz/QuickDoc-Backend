import mongoose, { Document, Schema } from "mongoose";
import { DepartmentInterface } from './departmentInterface';


export interface CreateDoctorInterfface{
    doctorName:string;
    email:string;
    phoneNumber:string;
    password:string;
    verificationToken :string;
}


export interface DoctorInterface extends Document{
    id: string;
    doctorName: string;
    email: string;
    phoneNumber : string;
    password: string;
    profilePicture?: string;
    role: "doctor";
    gender: string;
    education:string;
    description:string;
    certicateUpload?: string;
    lisenceCertificate?:string;
    department: mongoose.Types.ObjectId | DepartmentInterface;
    isVerified?:boolean; 
    isBlocked: boolean;
    isApproved:boolean;
    createdAt?: Date;
}