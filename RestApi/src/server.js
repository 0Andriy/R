// ! <================== Підключаємо необіхідні модулі =====================>
// ! <=====================================================================>
import express from "express";
import https from "https";
import fs from "fs";
// Для побудови path
import url from "url";
import path from "path";

// Між домені запити
import cors from 'cors';
// Для роботи з cookies в запитах
import cookieParser from "cookie-parser"

// Settings
import config from "./config/config.js";

// Middleware
import redirectToHttps from "./middleware/redirectHttpToHttps.js";
import checkAllowedDatabase from "./middleware/checkAllowedDatabase.js";
import authMiddleware from "./middleware/authMiddleware.js"
import checkAndModifyLogin from "./middleware/checkAndModifyLogin.js"
import errorHandler from "./middleware/errorHandler.js";

// Router
import userRouter from "./routes/userRoute.js"

// DB
import OracleDBManager from "./database/OracleDBManager.js"



// ! <=====================================================================>
// ! <======================== Створюємо додаток ==========================>
// ! <=====================================================================>
// Створюємо один сервіс -- app
const app = express();


// ! <======================== Add midleware ==============================>
// Redirect HTTP to HTTPS
app.use(redirectToHttps);
// Додаємо middleware для обробки CORS запитів
app.use(cors());
// Аналізуємо та декодуємо cookies -> req.cookies
app.use(cookieParser())
// Аналізуємо тіло запиту, та при можливості конвертуємо у JSON -> req.body
app.use(express.json());
// Аналізуємо тіло запиту у форматі application/x-www-form-urlencoded -> req.body
app.use(express.urlencoded({ extended: true }))
// Перевіряємо доступність назви бази і зберіагаємо її назву у req.locals 
app.use(checkAllowedDatabase)
// Дивимося чи є в body поле login і модифікуємо його
app.use(checkAndModifyLogin)


// * Можна додавати дальше загальні routes


app.get("/", (req, res, next) => {
    res.status(200).send("API WORKING ...");

    // throw CustomError.BadRequest("assd")
});




app.get("/test", (req, res, next) => {
    console.log(12)

    console.log(req.headers)

    // Отримуємо токен з заголовка або параметру запиту || req.query.token;
    const token = req.headers['authorization'] 

    console.log(token)

    if (token !== "Bearer 1234") {
        return res.status(401).json({ message: 'Токен не наданий' });
    }

    return res.status(200).json({ message: 'asdassadsadsadaasdasd' });
});





// Роути повязані з автентифікацією
app.use("/api/v1", authRouter)

// Всі наступні запити будуть для доступу вимаги наявність авторизованості користувача, або будуть помилки
app.use(authMiddleware)

// Роути пов'язані з користувачами
app.use("/api/v1", userRouter)

// Роути повязані з роботою -- додатка Portal
// app.use("/api/v1", portalRouter)


//! Перехоплювай всіх помилок (має бути обов'язково останім в middleware)
app.use(errorHandler)


// ! <====================== Settings Servers =========================>

// Робимо підключення до баз даних
// await OracleDBManager.connect("SAL")
// await OracleDBManager.connect("TEST")


// Read SSL certificate and key files
const httpsOptions = {
    key: fs.readFileSync("./src/certs/localhost.key", "utf8"),
    cert: fs.readFileSync("./src/certs/localhost.crt", "utf8"),
};

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

// Run https server
httpsServer.listen(config.server.port, config.server.host, () => {
    // const dataServer = httpsServer.address()
    // console.log(dataServer)
    console.log(`==> Server listens https://${config.server.host}:${config.server.port}`);
});





