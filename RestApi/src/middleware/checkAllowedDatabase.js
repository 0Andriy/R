
import OracleDBManager from "../database/OracleDBManager.js";
import CustomError from "../utils/customError.js"



function checkAllowedDatabase(req, res, next) {
    // Ім'я бази даних передається у параметрах маршруту
    const dbName = req.params.dbName; 
    
    // Перевіряємо чи у нас така назва бази (можливо треба робити якусь дефолтну, щоб не завжди передавати)
    if (!OracleDBManager.isDatabaseAllowed(dbName)) {
        // return res.status(403).json({ error: "Недозволена назва бази даних" });

        // Створюємо новий об'єкт помилки
        // const error = new Error('Неприпустима назва бази даних');
        // error.status = 400;

        // Передаємо помилку наступному middleware
        return next(new CustomError.BadRequest("Недозволена назва бази даних"))
    }
    
    // Додаємо ім'я бази даних до об'єкта req.locals для подальшого використання
    req.locals = {
        ...req.locals,
        dbName: dbName
    };
    
    // Передаємо керування наступному middleware
    next();
}

export default checkAllowedDatabase
