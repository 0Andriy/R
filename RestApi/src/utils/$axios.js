import axios from "axios"
import config from "../config/config"


const API_URL = "asdsadad"


const $api = axios.create({
    // Додаємо cookie
    withCredentials: true,
    baseUrl: API_URL
})


// Інтерсептор для запитів 
$api.interceptors.request.use( (config) => {
    // Зчитуємо токен
    const token = localStorage.getItem("token")

    // Модифікуємо headers
    config.headers.Authorization = `Bearer ${token}`

    // Вертаємо модифіковані налаштування
    return config
})


// Інтерсептор для відповідей
$api.interceptors.response.use( 
    (config) => {
        // Вертаємо налаштування
        return config
    },
    async (error) => {
        // Дані початкового запиту
        const originalRequest = error.config

        if (error.response.status == 401 && error.config && !error.config._isRetry) {
            // Робимо помітку, що цей запит повторний
            originalRequest._isRetry = true

            try {
                // Запит для оновлення токенів
                const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true })

                // Зберігаємо оновлену пару токенів
                localStorage.setItem("token", response.data.accessToken)

                // Пробуємо повторити першочерговий запит
                return $api.request(originalRequest)

            } catch (error) {
                console.log(`Користувач не авторизований`)
            }
        }

        // Всі інші помилки прокидуємо наверх
        throw error
    }
)



export default $api