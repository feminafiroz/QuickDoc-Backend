export default function doctorEntity(
    doctorName : string,
    email:string,
    phoneNumber:string,
    passsword:string,
    verification:string,
){
    return{
        getDoctorName: () : string => doctorName,
        getEmail : () : string => email,
        getphoneNumber : () : string => phoneNumber,
        getPassword : () : string => passsword,
        getVerificationToken : () : string => verification
    }
}

export type doctorEntityType = ReturnType<typeof doctorEntity>


export function googleSignInUserEntity(
    name: string,
    email: string,
    picture: string,
    email_verified: boolean,
  ){
    return {
        doctorName: (): string => name,
        email: (): string => email,
        picture: (): string => picture,
        email_verified: (): boolean => email_verified,
    };
  }
  
  export type googleSignInUserEntityType = ReturnType<typeof googleSignInUserEntity>;