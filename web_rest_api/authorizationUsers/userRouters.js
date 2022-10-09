import bodyParser from 'body-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import passwordHash from 'password-hash';

import {bodyValidateMiddleware} from "./middleware.js";
import {schema} from "../employeeValidators/joiValidator.js";
import {User} from "./crudUsers.js";

const parser = bodyParser.json();
export const usersRouter = express();
const SECRET = "hfdjhflldkjflkjdflkjdflkj";

usersRouter.post('/register', parser, bodyValidateMiddleware(schema.userPOST),
    async (request, response) => {
        try {
            const data = request.body;
            const user = await User.createUser(data);
            if (!user) {
                response.status(400).json({errorDetails: `User with login ${data.login} already exists`});
            }
            response.status(201).json(user);
        } catch {
            response.status(500).json({message: 'ERROR!'})
        }
    });

usersRouter.post('/login', parser, bodyValidateMiddleware(schema.userPOST),
    async (request, response) => {
        try {
            const login = request.body.login;
            const user = await User.getUserByLogin(login);
            if (user == null) {
                response.status(401).json({errorDetails: `User with login ${login} not exists`});
            } else {
                if (passwordHash.verify(request.body.password, user.password) === false) {
                    response.status(401).json({errorDetails: `Wrong password for user with login ${login}`});
                } else {
                    jwt.sign({id: user.id, login: user.login}, SECRET, {expiresIn: 5 * 60},
                        (error, token) => {
                            response.status(200).json({token});
                        });
                }
            }
        } catch {
            response.status(500).json({message: 'ERROR!'})
        }
    });