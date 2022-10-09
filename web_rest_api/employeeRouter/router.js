import {Router} from "express";
import bodyParser from "body-parser";
import {EmployeeController} from "../employeeController/controller.js";
import {schema} from "../employeeValidators/joiValidator.js";
import {bodyValidateMiddleware, verifyTokenMiddleware} from "../authorizationUsers/middleware.js";

const employeeRouter = new Router();
const parser = bodyParser.json();


//  post

employeeRouter.post(parser, bodyValidateMiddleware(schema.employeePOST), verifyTokenMiddleware(),
    async function (request, response) {
        try {
                const data = request.body;
                const employee = await EmployeeController.createEmployee(data);
                response.status(200).json(employee);
        } catch (e) {
            console.log(e);
        }
    }
);

//  get by id

employeeRouter.get('/:id', parser,
    async function (request, response) {
        try {
            const id = request.params.id;
            const employee = await EmployeeController.getOneEmployee(parseInt(id));
            if (employee) {
                response.status(200).json(employee);

            } else {
                response.status(404).json({"Details": `Employer with id ${id} not found`});
            }
        } catch (e) {
            console.log(e);
        }
    }
);

//  get all

employeeRouter.get(parser,
    async function (request, response) {
        try {
            const {error} = schema.filterSortGET.validate(request.query, {convert: true});
            if (error) {
                const {details} = error;
                const message = details.map(i => i.message).join(',');
                response.status(400).json({data: request.query, errorDetails: message});
            } else {
                const {fullname, sortedBy, order, page} = request.query;
                const employees = await EmployeeController.getAllEmployeesFilterSort(fullname, sortedBy, order, page);
                const outEmployees = {
                    employees: employees,
                    count: employees.length,
                };
                response.header("Access-Control-Allow-Origin", "*");
                response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Redirect");
                response.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
                //response.header("Access-Control-Allow-Credentials", true);
                response.set('Access-Control-Allow-Origin', '*');
                response.set('Access-Control-Allow-Headers', 'Content-Type')
                response.status(200).json(outEmployees);
            }
        } catch (e) {
             console.log(e);
        }
    }
);

//  put (update)

employeeRouter.put('/:id', parser, bodyValidateMiddleware(schema.employeePUT), verifyTokenMiddleware(),
    async function (request, response) {
        try {
                const data = request.body;
                const id = request.params.id;

                const employee = await EmployeeController.updateEmployee(parseInt(id), data);
                if (employee) {
                    response.status(200).json(employee)
                } else {
                    response.status(404).send(`Employer with id ${id} not found`);
                }
        } catch (e) {
            console.log(e);
        }
    }
);

//  delete

employeeRouter.delete('/:id', parser, verifyTokenMiddleware(),
    async function (request, response) {
        try {
            const id = request.params.id;
            const employee = await EmployeeController.deleteEmployee(parseInt(id));
            if (employee) {
                response.status(200).json(employee);
            } else {
                response.status(404).send(`Employer with id ${id} not found`);
            }
        } catch (e) {
            console.log(e);
        }
    }
);

export default employeeRouter;











