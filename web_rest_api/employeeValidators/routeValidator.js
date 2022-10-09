import express from "express";

export const routeValidator = express();

routeValidator.post('/', (req, res, next) => {
    const error = new Error('The route is set incorrectly!');
    if (error) {
        return res.status(404).json({message: "The route is set incorrectly!"})
    }
    next(error);
});

routeValidator.get('/', (req, res, next) => {
    const error = new Error('The route is set incorrectly!');
    if (error) {
        return res.status(404).json({message: "The route is set incorrectly!"})
    }
    next(error);
});

routeValidator.put('/', (req, res, next) => {
    const error = new Error('The route is set incorrectly!');
    if (error) {
        return res.status(404).json({message: "The route is set incorrectly!"})
    }
    next(error);
});

routeValidator.delete('/', (req, res, next) => {
    const error = new Error('The route is set incorrectly!');
    if (error) {
        return res.status(404).json({message: "The route is set incorrectly!"})
    }
    next(error);
});
