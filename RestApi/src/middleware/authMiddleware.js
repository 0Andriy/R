import JWTManager from "../utils/JWTManager,js";
import CustomError from "../utils/customError.js"


// Middleware для перевірки автентичності користувача
const authMiddleware = async (req, res, next) => {
    try {
        // Із заголовків запиту дістаємо інформацію по ключу -- Authorization або у query.t параметру
        const authHeader = req.headers['authorization'] || req.query.t

        // Якщо нема, значить користувач не авторезованій у нашій системі
        if (!authHeader) {
            return next(new CustomError.Unauthorized())
        }

        // Дістаємо саме токен з формату -- "Type token"
        const accessToken = authHeader.split(" ")[1]

        // Якщо там нічого нема значить користувач не авторезованій у нашій системі
        if (!accessToken) {
            return next(new CustomError.Unauthorized())
        }

        // Перевіряємо валідність токена з нашою системою і заодно дістаємо його навантаження (дані)
        const userData = await JWTManager.verifyAccessToken(accessToken, req.locals.dbName)

        // Якщо нікого не отримали, значить сталася проблема з вариіфкацією дальше не пускаємо
        if(!userData) {
            return next(new CustomError.Unauthorized())
        }

        // У req.user зберігаємо дані які дістали із навантаження токена
        req.user = userData

        // Передаємо керування наступному middleware
        next()

    } catch (error) {
        // Якщо щось пішло не так значить не даємо користувача дальше доступ і генеруємо помилку
        return next(new CustomError.Unauthorized())
    }
    
};


export default authMiddleware;