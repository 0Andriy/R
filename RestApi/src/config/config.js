
class Config {
    constructor() {
        // Налаштування сервера 
        this.server = {
            host: process.env.SERVER_HOST || "172.19.176.1",
            port: process.env.SERVER_PORT || 3000,
        }


        // Налаштування Cookies
        this.cookies = {
            ApiCookie: {
                name: "ApiCookie",
                opts: {
                    // Час життя cookie в ms -- 12h
                    maxAge: 1000 * 60 * 60 * 12,
                    // true -- щоб ці cookie, щою не можна було змінювати і отримати їх в браузері через js
                    httpOnly: true,
                    // true -- для передачі лише при https
                    secure: true,
                }
            },
        }


        // Налаштування JWT токенів
        this.JWT = {
            access: {
                type: "Bearer",
                name: "AccessToken",
                secretKey: "accessKey",
                opts: {
                    // Час життя токену
                    expiresIn: "5m",
                },
            },
            refresh: {
                type: "Bearer",
                name: "RefreshToken",
                secretKey: "refreshKey",
                opts: {
                    // Час життя токену
                    expiresIn: "8h",
                },
                // Налашутвання cookie саме для цього типу токенів
                cookie: {
                    name: "token",
                    opts: {
                        // Час життя cookie в ms -- 12h
                        maxAge: 1000 * 60 * 60 * 12,
                        // true -- щоб ці cookie, щою не можна було змінювати і отримати їх в браузері через js
                        httpOnly: true,
                        // true -- для передачі лише при https
                        secure: true,
                    },
                },
            },
        }


        // Налаштування Oracle бази даних
        this.oracleDB = {
            DriverMode: "thick", //"thick"
            ClientOpts: {
                libDir: "C\\instantclient_21_12",
            },
            // Основна база завжди має бути першою, щоб можна її брати по замовчуванні якщо буде потрібно
            db: {
                SAL: {
                    user: "admin",
                    password: "admin",
                    connectString: "admin",
                    // edition: 'ORA$BASE', // used for Edition Based Redefintion
                    // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
                    // externalAuth: false, // whether connections should be established using External Authentication
                    // homogeneous: true, // all connections in the pool have the same credentials
                    // poolAlias: 'default', // set an alias to allow access to the pool via a name.
                    // poolIncrement: 1, // only grow the pool by one connection at a time
                    // poolMax: 4, // maximum size of the pool. (Note: Increase UV_THREADPOOL_SIZE if you increase poolMax in Thick mode)
                    // poolMin: 0, // start with no connections; let the pool shrink completely
                    // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
                    // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
                    // queueMax: 500, // don't allow more than 500 unsatisfied getConnection() calls in the pool queue
                    // queueTimeout: 60000, // terminate getConnection() calls queued for longer than 60000 milliseconds
                    // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
                    // sodaMetaDataCache: false, // Set true to improve SODA collection access performance
                    // stmtCacheSize: 30, // number of statements that are cached in the statement cache of each connection
                    // enableStatistics: false // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
                },
    
                TEST: {
                    user: "admin",
                    password: "admin",
                    connectString: "admin",
                    // edition: 'ORA$BASE', // used for Edition Based Redefintion
                    // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
                    // externalAuth: false, // whether connections should be established using External Authentication
                    // homogeneous: true, // all connections in the pool have the same credentials
                    // poolAlias: 'default', // set an alias to allow access to the pool via a name.
                    // poolIncrement: 1, // only grow the pool by one connection at a time
                    // poolMax: 4, // maximum size of the pool. (Note: Increase UV_THREADPOOL_SIZE if you increase poolMax in Thick mode)
                    // poolMin: 0, // start with no connections; let the pool shrink completely
                    // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
                    // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
                    // queueMax: 500, // don't allow more than 500 unsatisfied getConnection() calls in the pool queue
                    // queueTimeout: 60000, // terminate getConnection() calls queued for longer than 60000 milliseconds
                    // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
                    // sodaMetaDataCache: false, // Set true to improve SODA collection access performance
                    // stmtCacheSize: 30, // number of statements that are cached in the statement cache of each connection
                    // enableStatistics: false // record pool usage for oracledb.getPool().getStatistics() and logStatistics()
                }
            }  
        }
    }
    

}

// Ignore SSL sertefications -- для виконання запитів до чогось
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// Експортуємо обєкт даного класу (Singlton)
export default new Config()