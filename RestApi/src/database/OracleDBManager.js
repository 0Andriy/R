import oracledb from "oracledb"
import config from "../config/config.js"

// Клас по шаблону Singleton (один екземпляр на весь проект)
class OracleDBManager {
    constructor(config) {
        // Дефолтні налаштування підключення (загальні і pool)
        this.defaultConfig = {
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

        // Дефолтні налаштування до запитів 
        this.defaultOptions = {
            autoCommit: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            // Обробник типів, просимо базу повернути певний тип даних в якому нам потрібно
            fetchTypeHandler: (metaData) => {
                // Tells the database to return BLOB as Buffer
                if (metaData.dbType === oracledb.DB_TYPE_BLOB) {
                    return {type: oracledb.BUFFER}
                }

                // Tells the database to return CLOB as String
                if (metaData.dbType === oracledb.DB_TYPE_CLOB) {
                    return {type: oracledb.STRING}
                }
            }
        }

        // Зберігаємо загальні конфіги
        this.config = config

        this.allowedNames = Object.keys(config.db)

        // Чи використовувати pool підключення як дефолтне
        this.usePool = true

        // Для збереження всіх активних звичайних підключень
        this.connections = {}

        // Для збереження всіх активних pool підключень
        this.pools = {}

        // Перевіряжмо певний режим роботи чи треба підключати додаткові налаштування
        if (config.DriverMode.toLowerCase() === "thick") {
            // enable node-oracledb Thick mode
            oracledb.initOracleClient(config.ClientOpts)
        }
    }


    // Перевірка чи є якесь підключення до бази взагалі
    async isDBConnected(dbName) {
        // Цей код буде перевіряти, чи є вказана назва бази даних ключем у властивості connections або pools класу OracleDBManager.
        // Якщо так, то метод поверне true, інакше - false.
        return this.connections.hasOwnProperty[dbName] || this.pools.hasOwnProperty[dbName];
    }


    // Перевіряємо чи є це імя в списку доступних баз
    async isDatabaseAllowed(dbName) {
        return this.allowedNames.includes(dbName);
    }


    // Підключення до бази для валідації користувача, під його (login, password)
    async authConnect(dbName, login, password) {

        let connection = null

        try {
            // Отримуємо всі налашутвання по імені бази з config
            const dbConfig = { 
                user: login,
                password: password,
                connectString: this.config.db[dbName].connectString
            }

            // Пробуємося підключитися до бази під конкретним користувачем
            connection = await oracledb.getConnection(dbConfig)

            console.log(`Connection was successful for user: ${login}`)

            // Користувач пройшов авторизацію
            return true

        } catch (error) {
            throw new Error(`Failed to authenticate user: ${login}`)

        } finally {
            if (connection){
                try {
                    await connection.close();
    
                } catch (error) {
                    console.error(err);
                }
            }
        }
    }


    // Створюємо підключення до бази даних з певним ім'ям
    async connect(dbName, usePool = this.usePool) {
        try {
            // Отримуємо всі налашутвання по імені бази з config
            const config = {
                ...this.defaultConfig,
                ...this.config.db[dbName]
            }


            if (usePool) {
                const pool = await oracledb.createPool(config)
                console.log(`Pool created for database: ${dbName}`)

                this.pools[dbName] = pool

            } else {
                const connection = await oracledb.getConnection(config)
                console.log(`Connected to database: ${dbName}`)

                this.connections[dbName] = connection
            }

        } catch (error) {
            console.log(`Error connecting to database: ${dbName}`, error)
        }
    }


    // Закриваємо підключення до бази даних з певним ім'ям
    async close(dbName, usePool = this.usePool) {
        try {
            if (usePool) {
                const pool = this.pools[dbName]
                
                if (pool) {
                    await pool.close()
                    console.log(`Pool closed for database: ${dbName}`)

                    delete this.pools[dbName]
                }

            } else {
                const connection = this.connections[dbName]
                
                if (connection) {
                    await connection.close()
                    console.log(`Connection closed for database: ${dbName}`)

                    delete this.connections[dbName]
                }
            }

        } catch (error) {
            console.log(`Error closing connection or pool: ${dbName}`, error);
        }
    }


    // Виконання одного запиту до бази даних з певним ім'ям
    async query(dbName, sql, params = {}, options = {}, usePool = this.usePool) {
        try {
            // робимо загальний обєкт де налаштування користувача, є важливішими ніж дефолтні
            const generalOptions = {...this.defaultOptions, ...options}

            // Зміна куди буде поміщено відповідний конект
            let connection = null

            if (usePool) {
                connection = this.pools[dbName]

            } else {
                connection = this.connections[dbName]
            }
            
            // Робимо перевірку чи є якийсь конект до бази з певним імям
            if(!connection) {
                throw new Error(`Database ${dbName} is not connected or pooled`)
            }

            // Виконуємо запит до бази
            const result = await connection.execute(sql, params, generalOptions)

            // Вертаємо рядки (список)
            return result.rows

        } catch (error) {
            throw new Error(`Error executing query: ${sql} ${error}`)

        } finally {
            if (connection && usePool) {
                try {
                    // Put the connection back in the pool
                    await connection.close()

                } catch (error) {
                    throw new Error(`Error close connection ${error}`)
                }
            }
        }
    }


    // Виконання одного запиту багато разів, а потім глобальний commit (якщо включений)
    async queryMany(dbName, sql, params = {}, options = {}, usePool = this.usePool) {
        // Зміна куди буде поміщено відповідний конект
        let connection = null

        try {
            // робимо загальний обєкт де налаштування користувача, є важливішими ніж дефолтні
            const generalOptions = {...this.defaultOptions, ...options}

            if (usePool) {
                connection = this.pools[dbName]

            } else {
                connection = this.connections[dbName]
            }
            
            // Робимо перевірку чи є якийсь конект до бази з певним імям
            if(!connection) {
                throw new Error(`Database ${dbName} is not connected or pooled`)
            }

            // Виконуємо запит до бази
            const result = await connection.executeMany(sql, params, generalOptions)

            // Вертаємо рядки (список)
            return result.rows

        } catch (error) {
            throw new Error(`Error executing queryMany: ${sql} ${error}`)

        } finally {
            if (connection && usePool) {
                try {
                    // Put the connection back in the pool
                    await connection.close()

                } catch (error) {
                    throw new Error(`Error close connection ${error}`)
                }
            }
        }
    }


    // Виконання PL/SQL скриптів
    async executePLSQL(dbName, script, params = {}, options = {}, usePool = this.usePool) {
        // Зміна куди буде поміщено відповідний конект
        let connection = null

        try {
            // робимо загальний обєкт де налаштування користувача, є важливішими ніж дефолтні
            const generalOptions = { ...this.defaultOptions, ...options }

            if (usePool) {
                connection = this.pools[dbName]

            } else {
                connection = this.connections[dbName]
            }

            // Робимо перевірку чи є якийсь конект до бази з певним імям
            if (!connection) {
                throw new Error(`Database ${dbName} is not connected or pooled`)
            }

            // Виконуємо запит до бази
            const result = await connection.execute(script, params, generalOptions)

            // Вертаємо результат
            return result

        } catch (error) {
            throw new Error(`Error executing PL/SQL script: ${script} ${error}`)

        } finally {
            if (connection && usePool) {
                try {
                    await connection.close()

                } catch (error) {
                    throw new Error(`Error closing connection ${error}`)
                }
            }
        }
    }
}



// Експортуємо обєкт даного класу (Singlton - один об'єкт на весь додаток)
export default new OracleDBManager(config.oracleDB)