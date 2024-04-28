import CustomError from "../utils/customError.js";


// Метод для обробки помилок
function errorHandler(err, req, res, next) {
    // якщо помилка є об'єктом класу CustomError
    if (err instanceof CustomError) {
        // Виводимо помилку
        console.log({
            code: err.statusCode,
            message: err.message,
            errors: err.errors,
            stack: err.stack,
        });

        
        return res.status(err.statusCode).json({
            code: err.statusCode,
            message: err.message,
            errors: err.errors,
            // stack: err.stack,
        })
    }


    // Unhandled errors
    console.error(err);

    res.status(500).json({
        code: 500,
        message: "Неочікувана помилка.",
        errors: err.errors,
        // stack: err.stack,
    });
}


// 
export default errorHandler

