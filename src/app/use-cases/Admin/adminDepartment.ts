// src/app/use-cases/Admin/adminDepartment.ts
import CustomError from "../../../utils/customError";
import { HttpStatus } from "../../../types/httpStatus";


import { CreateDepartmentInterface , DepartmentInterface} from "../../../types/departmentInterface";
import { IDepartmentRepository } from "../../interfaces/departmentRepositoryInterface";
import DepartmentEntity, { DepartmentEntityType } from "../../../entities/departmentEntity";

export const addDepartment = async (
  department: CreateDepartmentInterface, 
  departmentDbRepository: ReturnType<IDepartmentRepository>
  ) => {
    const{departmentName} = department;

    // check if deprtment alreasdy exists 
    const deparmentAlreadyExist = await departmentDbRepository.getDepartmentbyName(departmentName)
    if(deparmentAlreadyExist){
    throw new CustomError("Department already exists",HttpStatus.BAD_REQUEST);
    }

    const departmentEntity : DepartmentEntityType = DepartmentEntity(departmentName) ;
    
   // Add the department to the database
    return  await departmentDbRepository.addDepartment(departmentEntity);
    
};


export const getAllDepartments = async (departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.getAllDepartments();
};

export const updateDepartment = async (id: string, departmentName: string, departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.updateDepartment(id, departmentName);
};

export const blockDepartment = async (id: string, departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.blockDepartment(id);
};

export const unblockDepartment = async (id: string, departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.unblockDepartment(id);
};

export const listDepartments = async (departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.listDepartments();
};

export const unlistDepartments = async (departmentDbRepository: ReturnType<IDepartmentRepository>) => {
  return await departmentDbRepository.unlistDepartments();
};
