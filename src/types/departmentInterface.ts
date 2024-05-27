// src/types/departmentInterface.ts
import { Document } from "mongoose";

export interface CreateDepartmentInterface {
    departmentName: string;
    isListed?: boolean;
}


export interface DepartmentInterface extends Document {
    id: string;
    departmentName: string;
    isListed?: boolean;
    createdAt?: Date;
}