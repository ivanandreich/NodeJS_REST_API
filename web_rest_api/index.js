// http://localhost:3500/api/employees

import express from "express";
import cors from "cors";
import employeeRouter from "./employeeRouter/router.js";
import {routeValidator} from "./employeeValidators/routeValidator.js";
import {usersRouter} from "./authorizationUsers/userRouters.js";
import methodOverride from 'method-override';

const PORT = process.env.PORT || 3500;

const app = express();
//const cors = require(cors());

let corsOptions = {
    origin : ['http://localhost:5500'],
}


app.use(express.json());
app.use('/api/users', usersRouter)
app.use('/api/employees', employeeRouter);
app.use('*', routeValidator);
app.use(methodOverride());
app.use(cors(corsOptions));

app.use((error, request, response, next) => {
    console.error(error.stack);
    response.status(error.statusCode || 500).json({errorDetails: error.message});
});

function startApp() {
    app.listen(PORT, function (err) {
        if (err) {
            console.log("Error while starting server");
        } else {
            console.log("Server has been started at port: " + PORT);
        }
    });
}

startApp();

