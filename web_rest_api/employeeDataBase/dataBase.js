import knex from "knex";

export const dataBase = knex({
    client: 'pg',
    connection: 'postgres://fxrkzgpe:rt3BhYIo0jRBsrA5l49H3ENhGqmLkMhs@fanny.db.elephantsql.com/fxrkzgpe'
});

export function createTableEmployees() {
    dataBase.schema.createTableIfNotExists("employees", function (table) {
        table.increments('id').primary();
        table.string('fullname', 100).notNullable();
        table.date('birthday');
        table.string('position');
        table.integer('salary')
    }).then(row => console.log(row)).catch(error => console.log(error))
}

// export function createTableUsers(){
//     dataBase.schema.createTableIfNotExists("users", function (tableUsers){
//         tableUsers.increments('id').primary()
//         tableUsers.string('login').notNullable()
//         tableUsers.string('password').defaultTo('admin')
//     })
// }

export function createTableUsers() {
    dataBase.schema.createTableIfNotExists("users", table => {
        table.increments('id').primary();
        table.string('login').unique().notNullable();
        table.string('password').notNullable();
    }).then(row => console.log(row)).catch(error => console.log(error));
}

createTableEmployees();
createTableUsers();





















//////////////////////////////////////////////////////////////////////////////
// FOR INPUT TO THE PSQL SHELL (COMMAND STRING) you should input next command:
//
// const Pool = require('pg').Pool;
//
// const pool = new Pool({
//     user: "postgres",
//     password: "03121948ded",
//     host: "localhost",
//     port: 5432,
//     database: "node_postgres"
// })
//
// module.exports = pool;