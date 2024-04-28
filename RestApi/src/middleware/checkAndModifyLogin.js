

function checkAndModifyLogin(req, res, next) {
    // Перевіряємо, чи існує поле "login" у тілі запиту
    if (req.body.login) {
        // Зміна для підкорегованого логіну
        let normalizedLogin = null

        // Отримуємо дані з тіла запиту (логін, який прилетів від користувача)
        const { login } = req.body  

        // Робимо перевірку які символу у логіні (кирилиця - якщо є хочаб один кириличний символ...)
        if(/[а-яА-Я]/.test(login)) {
            normalizedLogin = login

        } else {
            normalizedLogin = login.toUpperCase()
        }

        // Назад у тіло перезаписуємо нормалізований логін
        req.body.login = normalizedLogin

    }

    // Передаємо керування наступному middleware
    next()

}


export default checkAndModifyLogin