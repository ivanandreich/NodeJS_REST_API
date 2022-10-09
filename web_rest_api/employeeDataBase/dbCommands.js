import cli from 'cli-command';
import {createTableEmployees} from "./dataBase";
import {createTableUsers} from "./dataBase";

cli().command('create_employer').action(createTableEmployees().createTable());
cli().command('drop_employer').action(createTableEmployees().dropTable());

cli().command('create_user').action(createTableUsers.createTable());
cli().command('drop_user').action(createTableUsers.dropTable());