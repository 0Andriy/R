
// Функція перенаправлення з HTTP на HTTPS
function redirectToHttps(req, res, next) {
    // Якщо підключення не безпечне, тобто http
    if (!req.secure) {
        // Redirect HTTP requests to HTTPS
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }

    // Йдемо до наступного middleware
    next();

}


// Експортуємо middleware для використання в інших файлах
export default redirectToHttps;