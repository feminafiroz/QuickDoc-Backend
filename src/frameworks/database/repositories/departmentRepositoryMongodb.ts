// frameworks/database/repositories/departmentRepositoryMongodb.ts

import DepartmentEntity from '../../../entities/departmentEntity';
import { DepartmentEntityType } from '../../../entities/departmentEntity';
import Department from "../models/department";

export const departmentRepositoryMongodb = () => {
    const Departments =  async () => await Department.find({ isListed: true }); 

    const getDepartmentbyName = async(departmentName:string)=>{
      return await Department.findOne({ departmentName: new RegExp(`^${departmentName}$`, 'i') });
    }
  
    const addDepartment = async (department: DepartmentEntityType) => {
      const newDepartment = new Department({
        departmentName : department.getDepartmentName(),
        isListed:  department.getIsListed()
      })
      return await newDepartment.save()
    };
  
    const getAllDepartments = async () => {
      return await Department.find();
    };
  
    const updateDepartment = async (id: string, departmentName: any) => {
      await Department.updateOne({ _id: id }, { $set: departmentName });
    };
  
    const blockDepartment = async (id: string) => {
      await Department.updateOne({ _id: id }, { $set: { isListed: false } });
    };
  
    const unblockDepartment = async (id: string) => {
      await Department.updateOne({ _id: id }, { $set: { isListed: true } });
    };
  
    const listDepartments = async () => {
      return await Department.find({ isListed: true })
    };
  
    const unlistDepartments = async () => {
      return await Department.find({ listed: false })
    };
  
    return {
      addDepartment,
      getAllDepartments,
      updateDepartment,
      blockDepartment,
      unblockDepartment,
      listDepartments,
      unlistDepartments,
      getDepartmentbyName
    };
  };
  
  export type departmentRepositoryMongodbType = typeof departmentRepositoryMongodb;
  