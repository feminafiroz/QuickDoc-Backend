// domain/entities/departmentEntity.ts

export default function DepartmentEntity(
    departmentName: string,
    isListed: boolean = true,
    // id?: string // Optional id for existing departments
) {
    return {
        // getId: (): string | undefined => id,
        getDepartmentName: (): string => departmentName,
        getIsListed: (): boolean => isListed
    };
}

export type DepartmentEntityType = ReturnType<typeof DepartmentEntity>
