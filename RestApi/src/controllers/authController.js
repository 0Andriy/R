import config from "../config/config.js"
import AuthService from "../services/authService.js"


class AuthController {
    // Регистрація
    async registration(req, res, next) {
        try {
            
            console.log("Пустий метод регестрації")

        } catch (error) {
            // Перекидаємо помилку в errorMiddleware
            next(error)
        }
    }

    
    // Авторизація
    async login(req, res, next) {
        try {
            // // Пробуємо дістати токен з req.query параметрів для можливості SSO
            // const token = req.query.t
            // // Якщо дістали токен запускаємо процес авторизації по ньому
            // if(!token) {

            // }


            // дістаємо дані з тіла (декомпозиція)
            const { login, password } = req.body

            // валідуємо користувача
            const userData = await AuthService.login(login, password)

            // вставляємо refreshToken в cookie клієнту
            res.cookie(config.JWT.refresh.cookie.name, userData.refreshToken, config.JWT.refresh.cookie.opts)

            // Вертаємо відповідь на запит
            return res.status(200).json(userData)
            
        } catch (error) {
            // Перекидаємо помилку в errorMiddleware
            next(error)
        }
    }


    // Вихід
    async logout(req, res, next) {
        try {
            // Пробуємо дістати refreshToken з cookie клієнта по їх назві
            let refreshToken = req.cookie[config.JWT.refresh.cookie.name]

            // Якщо не змогли дістати refreshToken з cookie, пробуємо дістати його з req.body
            if(!refreshToken) {
                refreshToken = req.body.refreshToken
            }

            // Запускаємо сервіс (Видаляємо даний refreshToken з бази даних)
            const token = await AuthService.logout(refreshToken)

            // Чистимо cookie з відповіним ім'ям у користувача
            res.clearCookie(config.JWT.refresh.cookie.name)
            
            // Вертаємо відповідь на запит
            return res.status(200).json({message: "Користувач успішно вийшов із системи."})

            
        } catch (error) {
            // Перекидаємо помилку в errorMiddleware
            next(error)
        }
    }


    // Оновлення пари токенів
    async refresh(req, res, next) {
        try {
            // Пробуємо дістати refreshToken з cookie клієнта по їх назві
            let refreshToken = req.cookie[config.JWT.refresh.cookie.name]

            // Якщо не змогли дістати refreshToken з cookie, пробуємо дістати його з req.body
            if(!refreshToken) {
                refreshToken = req.body.refreshToken
            }

            // Оновлюємо дані про користувача
            const userData = await AuthService.refresh(refreshToken)

            // вставляємо refreshToken в cookie клієнту
            res.cookie(config.JWT.refresh.cookie.name, userData.refreshToken, config.JWT.refresh.cookie.opts)

            // Вертаємо відповідь на запит
            return res.status(200).json(userData)

            
        } catch (error) {
            // Перекидаємо помилку в errorMiddleware
            next(error)
        }
    }
}


export default new AuthController()