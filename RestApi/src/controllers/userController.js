import config from "../config/config.js"
import UserService from "../services/userService.js"


class UserController {
    // Дістати всю інформацію про користувача
    async getUser(req, res, next) {
        try {
            
        

        } catch (error) {
            // Перекидаємо помилку в errorMiddleware
            next(error)
        }
    }

    

}


export default new UserController()