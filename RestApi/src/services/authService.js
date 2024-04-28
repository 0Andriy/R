// Підключаємо моделі якщо потрібно

import CustomError from "../utils/customError.js"
import OracleDBManager from "../database/OracleDBManager.js"
import JWTManager from "../utils/JWTManager.js"


class AuthService {
    // Регистрація
    async registration() {
        console.log("Пустий метод регестрації")
    }

    // Авторизація
    async login(login, password) {
        // Пробуємо авторизувати користувача через підключення до бази даних
        const isAuthUser = await OracleDBManager.authConnect(login, password)

        // Якщо ми не отримали true (тобто користувач не авторизувався)
        if (!isAuthUser) {
            throw CustomError.BadRequest("Не вдалося авторизувати користувача.")
        }

        // Запит для отримання інформації про користувача з бази
        const sql = ''

        // Параметри до sql запиту
        const params = {
            login: login
        }

        // Отримуємо інформацію про користувача з бази даних (оскільки вертається список)
        const userData = (await OracleDBManager.query(req.locals.dbName, sql, params))[0]

        // Перевіряємо чи знайшли якусь інформацію про користувача
        if (!userData) {
            throw CustomError.BadRequest("Не вдалося знайти інформацію про користувача.")
        }

        // Генеруємо токени з інформацією про користувача
        const tokens = await JWTManager.generateAccessAndRefreshToken({...userData}, req.locals.dbName)

        // Зберігаємо refreshToken в базі даних
        JWTManager.saveToken(tokens.refreshToken, req.locals.dbName)

        // Вертаємо результат (токени і дані про поточного користувача)
        return { ...tokens, user: userData }

    }


    // Вихід
    async logout(refreshToken) {
        // Видаляємо refreshToken з бази даних
        const token = await JWTManager.removeToken(refreshToken, req.locals.dbName)
        // Вертаємо результат
        return token
    }


    // Оновлення токенів
    async refresh(refreshToken) {
        // Перевіряємо чи дійсно ми отримали refreshToken
        if(!refreshToken){
            // Якщо нема токена то користувач не авторизований у нашій системі
            throw CustomError.Unauthorized()
        }

        // Пробуємо про валідувати токен (перевіряємо чи все з ним добре)
        const userData = JWTManager.verifyRefreshToken(refreshToken, req.locals.dbName)

        // Пробуємо знайти цей токен в базі даних
        const tokenFromDB = await JWTManager.findToken(refreshToken, req.locals.dbName)

        // Робимо перевірку чи всі валідації пройшли успішно
        if(!userData || !tokenFromDB) {
            // якщо одна провалилася то користувач не авторизованй
            throw CustomError.Unauthorized()
        }

        // TODO: Можливо треба додати, щоб діставати оновлену інформацію про користувача з бази даних

        // Генеруємо токени з інформацією про користувача
        const tokens = await JWTManager.generateAccessAndRefreshToken({...userData}, req.locals.dbName)

        // Зберігаємо refreshToken в базі даних
        JWTManager.saveToken(tokens.refreshToken, req.locals.dbName)

        // Вертаємо результат (токени і дані про поточного користувача)
        return { ...tokens, user: userData }

    }
}


export default new AuthService()