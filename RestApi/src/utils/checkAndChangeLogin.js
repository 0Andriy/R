

function checkAndChangeLogin(login) {
    let normalizedLogin = null

    // Робимо перевірку які символу у логіні (кирилиця - якщо є хочаб один кириличний символ...)
    if(/[а-яА-Я]/.test(login)) {
        normalizedLogin = login

    } else {
        normalizedLogin = login.toUpperCase()
    }

    // Вертаємо остаточний логін
    return normalizedLogin
}


export default checkAndChangeLogin