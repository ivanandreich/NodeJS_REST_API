import {dataBase} from "../employeeDataBase/dataBase.js";

export class EmployeeController {
    static #dataBase = dataBase;
    static #table_name = 'employees';

    // 1) create employee

    static async createEmployee(data) {
        const [employee] = await EmployeeController
            .#dataBase(EmployeeController.#table_name)
            .insert(data)
            .returning("*");
        return employee;
    }

    // 2) get by id

    static async #getOneEmployee(id) {
        return EmployeeController
            .#dataBase(EmployeeController.#table_name)
            .select('*')
            .where({id: id})
            .returning("*");
    }

    static async getOneEmployee(id) {
        const [employee] = await EmployeeController
            .#getOneEmployee(id);
        return employee;
    }

    // 3) sort and filter employee

    static async getAllEmployeesFilterSort(
        fullname = null,
        sortedBy = 'salary',
        sortOrder = 'ASC',
        pageNumber = null
    ) {
        const pageSize = 5;
        const query = dataBase(EmployeeController.#table_name).select('');
        let [allCount] = await dataBase(EmployeeController.#table_name).count('');
        allCount = Number.parseInt(allCount.count);
        if (fullname) {
            query.whereRaw(`LOWER(fullname) LIKE '%${fullname.toLowerCase()}%'`);
        }


        query.orderBy(sortedBy, sortOrder);
        if (pageNumber) {
            query.limit(pageSize);
            query.offset(pageSize * (pageNumber - 1));
        }
        return {employees: await query, allCount: allCount};
    }

    // 4) update employee

    static async updateEmployee(id, data) {
        let [employee] = await EmployeeController
            .#getOneEmployee(id);
        if (!employee) {
            return null;
        }
        [employee] = await EmployeeController
            .#dataBase(EmployeeController.#table_name)
            .where({id: id})
            .update(data)
            .returning("*");
        return employee;
    }

    // 5) delete employee

    static async deleteEmployee(id) {
        let [employee] = await EmployeeController
            .#getOneEmployee(id);
        if (!employee) {
            return null;
        }

        [employee] = await EmployeeController
            .#dataBase(EmployeeController.#table_name)
            .del()
            .where({id: id})
            .returning("*");
        return employee;
    }

}















