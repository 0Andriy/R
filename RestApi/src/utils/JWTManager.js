import * as jwt from "jsonwebtoken"
import oracledb from "oracledb"

import dbConnect from "../database/OracleDBManager.js"
import config from "../config/config.js"

class JWTManager {
    constructor(config) {
        this.config = config
        this.allowedTokenTypes = Object.keys(config.JWT)
    }


    // Загальний метод роботи з токенами
    async handleToken(payload, type, dbName, action) {
        // Переводимо текст в нижній регіст для впевненості
        const normalizedType = type.toLowerCase()
        
        // Робимо перевірку чи є запрошений тип в доступних
        if (!this.allowedTokenTypes.includes(normalizedType)) {
            throw new Error(`Invalid token type: ${type}`)
        }

        // Отримуємо секретний ключ для даного типу
        const secretKey = await this.getSecretKey(normalizedType, dbName)
        // Отримуємо налаштування для даного типу
        const opts = await this.getOpts(normalizedType)

        // Місце для зберегання токену
        let tokenData = null

        try {
            if (action === 'generate') {
                tokenData = jwt.sign(payload, secretKey, opts)

            } else if (action === 'verify') {
                tokenData = jwt.verify(payload, secretKey)
            }

            // Вертаємо результат
            return tokenData

        } catch (error) {
            return null
            
            // throw new Error(`Token ${action} failed: ${error.message}`)
        }
    } 


    // Отримуємо секретний ключ для певного типу
    async getSecretKey(type, dbName){
        let secretKey = null
        let sql = null
        let params = null

        try {
            const normalizedType = type.toLowerCase()

            if (normalizedType === "access"){
                // Запит для отримання даного типу секретного ключа
                sql = `begin
                        :key := BASE_OBJ.SSO_PKG.get_s_key_f(1,1)
                    end;`

            } else if (normalizedType === "refresh") {
                // Запит для отримання даного типу секретного ключа
                sql = `begin
                        :key := BASE_OBJ.SSO_PKG.get_s_key_f(2,2)
                    end;`
            }

            // Парамтери до запиту
            params = {
                key: {dir: oracledb.BIND_OUT, type: oracledb.STRING}
            }

            // Отримуємо секретний ключ з бази
            secretKey = (await dbConnect.executePLSQL(dbName, sql, params)).outBinds.key

            // Вертаємо секретний ключ по запиту
            return secretKey
            
        } catch (error) {
            throw new Error(`Failed to get secret key: ${error.message}`)
        }
    }


    // Отримати налаштування для певного типу
    async getOpts(type) {
        return this.config.JWT[type.toLowerCase()].opts

        // let opts = null

        // try {
        //     const typeConfig = config.JWT[type.toLowerCase()]

        //     if (!typeConfig) {
        //         throw new Error(`Invalid token type: ${type}`)
        //     }

        //     // Вертаємо налаштування до запиту
        //     return typeConfig.opts

        // } catch (error) {
        //     throw error
        // }
    }


    // // Генерація токенів
    // async generateToken(payload, type, dbName){
    //     // Отримуємо секретний ключ для даного типу
    //     const secretKey = await this.getSecretKey(type, dbName)
    //     // Отримуємо налаштування для даного типу
    //     const opts = await this.getOpts(type, dbName)

    //     // Генеруємо токен з відповідними налаштуваннями
    //     const token = jwt.sign(payload, secretKey, opts)
    //     // Вертаємо токен
    //     return token
    // }

    async generateToken(payload, type, dbName) {
        return this.handleToken(payload, type, dbName, 'generate')
    }


    // // Валідація токена - перевірка чи все добре з ним
    // async verifyToken(token, type, dbName) {
    //     // Отримуємо секретний ключ для даного типу
    //     const secretKey = await this.getSecretKey(type, dbName)

    //     try {
    //         // Валідуємо токен і заодно дістаємо його навантаження
    //         const data = jwt.verify(token, secretKey)
    //         // Вертаємо навантаження, що і свідчить про цспішну валідаю токена
    //         return data

    //     } catch (error) {
    //         throw new Error(`Token verification failed: ${error.message}`)
    //     }
    // }


    async verifyToken(token, type, dbName) {
        return this.handleToken(token, type, dbName, 'verify')
    }



    // // Генеруємо accessToken
    // async generateAccessToken(payload, dbName) {
    //     const token = await this.generateToken(payload, "access", dbName)
    //     return token
    // }

    async generateAccessToken(payload, dbName) {
        return this.generateToken(payload, "access", dbName)
    }


    // // Валідуємо accessToken
    // async verifyAccessToken(token, dbName) {
    //     try {
    //         const data = await this.verifyToken(token, "access", dbName)
    //         return data

    //     } catch (error) {
    //         throw error
    //     }
    // }

    async verifyAccessToken(token, dbName) {
        return this.verifyToken(token, "access", dbName)
    }


    // // Генеруємо refreshToken
    // async generateRefreshToken(payload, dbName) {
    //     const token = await this.generateToken(payload, "refresh", dbName)
    //     return token
    // }

    async generateRefreshToken(payload, dbName) {
        return this.generateToken(payload, "refresh", dbName)
    }


    // // Валідуємо refreshToken
    // async verifyRefreshToken(token, dbName) {
    //     try {
    //         const data = await this.verifyToken(token, "refresh", dbName)
    //         return data

    //     } catch (error) {
    //         throw error
    //     }
    // }

    async verifyRefreshToken(token, dbName) {
        return this.verifyToken(token, "refresh", dbName)
    }


    // Генеруємо пару accessToken і refreshToken
    async generateAccessAndRefreshToken(payload, dbName) {
        const accessToken = await this.generateAccessToken(payload, dbName)
        const refreshToken = await this.generateRefreshToken(payload, dbName)
        
        const accessData = await this.verifyAccessToken(accessToken, dbName)

        return {
            // Час життя 
            accessExpiresIn: accessData.exp,
            // Токени
            accessToken: accessToken,
            refreshToken: refreshToken,
        }
    }


    // Збереження refreshToken в базі даних
    async saveToken(refreshToken, dbName) {
        
        // Робимо перевірку чи є токен
        if(refreshToken) {
            // Зберігаємо токен в базі даних

            return
        }

        // Якщо користувач заходить перший раз (нема збереженого токену)
        

    }


    // Видалення refreshToken в базі даних
    async removeToken(refreshToken, dbName) {

        // Робимо перевірку чи є токен
        if(refreshToken) {
            

            return
        }

        
    }


    // Шукаємо токен в базі даних
    async findToken(refreshToken, dbName) {

        // Робимо перевірку чи є токен
        if(refreshToken) {
            

            return
        }

        
    }

}


// Експортуємо об'єкт даного класу (Singlton - один об'єкт на весь додаток)
export default new JWTManager(config)