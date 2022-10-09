import jwt from 'jsonwebtoken';

const SECRET = "hfdjhflldkjflkjdflkjdflkj";

export const bodyValidateMiddleware = schema => {
    return (request, response, next) => {
        const {error} = schema.validate(request.body);
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const {details} = error;
            const message = details.map(i => i.message).join(',');

            console.log('error', message);
            response.status(400).json({data: request.body, errorDetails: message});
        }
    };
};

export const verifyTokenMiddleware = () => {
    return (request, response, next) => {
        try {
            const token = request.headers.authorization.replace(/^Bearer\s+/, '');
            jwt.verify(token, SECRET, error => {
                if (error) {
                    response.status(401).json({
                        errorDetails: 'Unauthorized Access!',
                    });
                } else {
                    next();
                }
            });
        } catch (error) {
            next(error);
        }
    };
};