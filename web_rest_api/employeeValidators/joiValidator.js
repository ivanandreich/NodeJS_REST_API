import Joi from "joi";

export const schema = {
    employeePOST: Joi.object().keys({
        fullname: Joi.string()
            .trim()
            .min(1)
            .max(100)
            .required(),
        birthday: Joi.date()
            .required(),
        position: Joi.string()
            .trim()
            .valid('Junior Software Engineer', 'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer')
            .required(),
        salary: Joi.number()
            .integer()
            .options({convert: false})
            .min(0)
            .required()
    }),
    employeePUT: Joi.object().keys({
        fullname: Joi.string()
            .trim()
            .min(1)
            .max(100),
        birthday: Joi.date(),
        position: Joi.string()
            .trim()
            .valid('Junior Software Engineer', 'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer'),
        salary: Joi.number()
            .integer()
            .options({convert: false})
            .min(0)
    }),
    filterSortGET: Joi.object().keys({
        fullname: Joi.string()
            .min(1)
            .max(100),
        sortedBy: Joi.string()
            .valid('id', 'fullname', 'birthday', 'position', 'salary')
            .insensitive(),
        order: Joi.string()
            .valid('asc', 'desc')
            .insensitive(),
        page: Joi.number()
            .min(1)
            .integer(),
    }),
    userPOST: Joi.object().keys({
        login: Joi.string()
            .min(6)
            .max(100)
            .required(),
        password: Joi.string()
            .min(8)
            .max(100)
            .required(),
    })
}
















// const Joi = require('joi');
//
// const schemas = {
//     employeePOST: Joi.object().keys({
//         name: Joi.string().min(1).max(100).required(),
//         surname: Joi.string().min(1).max(100).required(),
//         position: Joi.string().valid('Junior Software Engineer', 'Software Engineer',
//             'Senior Software Engineer', 'Lead Software Engineer'),
//         date_of_birth: Joi.date().required(),
//         salary: Joi.number().min(0).integer().required(),
//     }),
//     filterSortGET: Joi.object().keys({
//         name: Joi.string().min(1).max(100),
//         surname: Joi.string().min(1).max(100),
//         sorted: Joi.bool(),
//         order: Joi.string().valid('asc', 'desc').insensitive(),
//         page: Joi.number().min(0).integer(),
//     }),
//     byID: Joi.object().keys({
//         id: Joi.number().min(0).integer(),
//     }),
//     userAuthentication: Joi.object().keys({
//         name: Joi.string().min(1).max(100).required(),
//         password_digest: Joi.string().min(1).max(100).required(),
//     }),
// };
//
// module.exports = {
//     schemas,
// }



