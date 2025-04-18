export const errorhandler = (statusCode,msg)=>{
    const error = new Error();
    error.statusCode = statusCode;
    error.message = msg;
    return error;   
}