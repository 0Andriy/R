// Імпортуємо бібліотеку LowDB
import low from "lowdb"
// Імпортуємо модуль FileSync з LowDB
import FileSync from "lowdb/adapter/FileSync"
// Імпортуємо модуль path для роботи з шляхами файлів
import path from 'path'
// Імпортуємо модуль fs для роботи з файловою системою
import fs from 'fs'


// Об'являємо клас LowDBManager
class LowDBManager {
    // Конструктор класу, приймає назву файлу бази даних
    constructor(fileName = "lowDB.json", directoryPath = process.cwd()) {
        // Формуємо абсолютний шлях до файлу бази даних
        const filePath = path.resolve(directoryPath, fileName);

        // Отримуємо шлях до директорії, де має бути розташований файл
        const dir = path.dirname(filePath);

        // Перевіряємо, чи існує директорія, де має бути розташований файл
        if (!fs.existsSync(dir)) {
            // Якщо директорія не існує, створюємо її разом з усіма батьківськими директоріями
            fs.mkdirSync(dir, { recursive: true });
        }

       // Зберігаємо абсолютний шлях до файлу бази даних
        this.fileName = filePath
        // Створюємо об'єкт адаптера для роботи з файлом бази даних
        this.adapter = new FileSync(filePath)
        // Ініціалізуємо базу даних LowDB з використанням adapter
        this.db = low(this.adapter)
        // За замовчуванням створюємо пусту базу даних, якщо файл не існує
        this.db.defaults({}).write(); // Встановлюємо значення за замовчуванням для бази даних
    }


    // * <==========================================================================================>


    // Метод для збереження даних в базі даних (переписати всю базу цими даними -- замінити весь вміст)
    save(data) {
        try {
            // Перевіряємо, чи існує файл бази даних
            if (fs.existsSync(this.fileName)) {
                // Якщо файл існує, встановлюємо новий стан бази даних і зберігаємо його в файл
                this.db.setState(data).write();
            } else {
                // Якщо файл не існує, створюємо новий файл і записуємо в нього передані дані
                fs.writeFileSync(this.fileName, JSON.stringify(data));
            }
        } catch (error) {
            // У випадку помилки (наприклад, недоступності файлу) виводимо повідомлення про помилку
            console.error('Error occurred while saving data:', error);
        }
    }


    // * <==========================================================================================>


    // Метод для отримання всіх даних з бази даних
    getAll() {
        try {
            // Перевіряємо, чи існує файл бази даних
            if (fs.existsSync(this.fileName)) {
                // Якщо файл існує, повертаємо стан бази даних (всі дані з файлу бази даних)
                return this.db.getState();
            } else {
                // Якщо файл не існує, повертаємо порожній об'єкт або null, або ви можете визначити поведінку за замовчуванням
                return {}; // Повертаємо порожній об'єкт
            }
        } catch (error) {
            // У випадку помилки (наприклад, недоступності файлу) повертаємо порожній об'єкт або null
            console.error('Error occurred while getting data:', error);
            return null; // Повертаємо null
        }
    }


    // Метод для отримання всіх даних з бази даних по певній колекції
    getAllFromCollection(collectionName) {
        // Отримуємо всі дані з конкретної колекції
        return this.db.get(collectionName).value(); 
    }


    // Отримати дані за якоюсь умовою вибірки
    getByCondition(collectionName, condition) {
        return this.db.get(collectionName).filter(condition).value();
    }
    

    // * <==========================================================================================>


    // Метод для додавання даних до певної колекції
    create(collectionName, data) {
        // Перевіряємо, чи існує колекція з вказаною назвою
        if (!this.db.has(collectionName).value()) {
            // Якщо колекція не існує, створюємо її з порожнім масивом
            this.db.set(collectionName, []).write();
        }

        // Додаємо новий об'єкт до колекції з використанням методу push()
        this.db.get(collectionName).push(data).write();
    }


    // * <==========================================================================================>


    // Метод для оновлення записів у колекції бази даних за певною умовою
    updateByCondition(collectionName, condition, newData) {
        // Отримуємо записи, які відповідають вказаній умові
        const recordsToUpdate = this.db.get(collectionName).filter(condition).value();
        
        // Оновлюємо кожен запис за вказаною умовою
        recordsToUpdate.forEach(record => {
            this.db.get(collectionName).find(record).assign(newData).write();
        });
        
        return recordsToUpdate.length; // Повертаємо кількість оновлених записів
    }


    // // Метод для оновлення даних в певній колекції за ідентифікатором
    // update(collectionName, id, data) {
    //     this.db.get(collectionName).find({ id }).assign(data).write();
    // }


    // Метод для оновлення даних в певній колекції за першим же збігом
    updateOne(collectionName, filter, update) {
        // Оновлюємо перший документ, що відповідає фільтру, застосовуючи зазначені оновлення
        return this.db.get(collectionName).find(filter).assign(update).write();
    }


    // * <==========================================================================================>


    // Метод для видалення записів з колекції бази даних за певною умовою
    deleteByCondition(collectionName, condition) {
        // Отримуємо записи, які відповідають вказаній умові
        const recordsToDelete = this.db.get(collectionName).filter(condition).value();
        
        // Видаляємо кожен запис за вказаною умовою
        recordsToDelete.forEach(record => {
            this.db.get(collectionName).remove(record).write();
        });
        
        return recordsToDelete.length; // Повертаємо кількість видалених записів
    }


    // // Метод для видалення даних з певної колекції за ідентифікатором
    // delete(collectionName, id) {
    //     this.db.get(collectionName).remove({ id }).write();
    // }

}



// Експортуємо обєкт даного класу (Singlton - один об'єкт на весь додаток)
export default new LowDBManager("lowDB.json", "/path/to/directory")



// Examples

// Зберігаємо дані у файлі бази даних
// const data = { users: [{ id: 1, name: "John" }, { id: 2, name: "Alice" }] };
// dbManager.save(data);


// Отримуємо всі дані з колекції "users"
// const allUsers = dbManager.getAllFromCollection("users");
// console.log(allUsers);


// Отримуємо користувачів з ім'ям "John" з колекції "users"
// const johnUsers = dbManager.getByCondition("users", { name: "John" });
// console.log(johnUsers);


// Додаємо нового користувача в колекцію "users"
// const newUser = { id: 3, name: "Bob" };
// dbManager.insertOne("users", newUser);



// Оновлюємо ім'я користувача з id 2 на "Mary" в колекції "users"
// dbManager.updateOne("users", { id: 2 }, { name: "Mary" });



// Видаляємо користувача з id 1 з колекції "users"
// dbManager.deleteOne("users", { id: 1 });