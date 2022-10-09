import passwordHash from 'password-hash';
import {dataBase} from "../employeeDataBase/dataBase.js";

export class User {
    static #tableName = 'users';

    static async getUserByLogin(login) {
        return dataBase(User.#tableName).where({login: login}).first().catch(error => {
            throw error;
        });
    }

    static async createUser(data) {
        let user = await User.getUserByLogin(data.login);
        if (user) {
            return null;
        }

        data.password = passwordHash.generate(data.password);
        [user] = await dataBase(User.#tableName).insert(data).returning(['id', 'login']).catch(error => {
            throw error;
        });
        return user;
    }
}