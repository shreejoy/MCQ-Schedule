const Joi = require("joi");

const validateMCQCreate = (body, headers) => {
    const createSchema = {
        body: Joi.object()
            .keys({
                date: Joi.date().default(Date.now()),
                question: Joi.string().required(),
                code: Joi.string().optional(),
                explaination: Joi.string().optional(),
                option_1_value: Joi.string().required(),
                option_2_value: Joi.string().required(),
                option_3_value: Joi.string().required(),
                option_4_value: Joi.string().required(),
                correct_option: Joi.string().required(),
                published: Joi.boolean().default(false),
                author: Joi.string().required(),
                screenshot: Joi.string().when('code', {
                    is: Joi.exist(),
                    then: Joi.required(),
                }),
            })
            .options({
                stripUnknown: true,
            }),
        headers: Joi.object()
            .keys({
                token: Joi.string().required(),
            })
            .options({
                stripUnknown: true,
            }),
    };

    return Joi.compile(createSchema).validate({
        body,
        headers,
    });
};

const validateMCQList = (query, headers) => {
    const listSchema = {
        query: Joi.object()
            .keys({
                cursor: Joi.string(),
            })
            .options({
                stripUnknown: true,
            }),
        headers: Joi.object()
            .keys({
                token: Joi.string(),
            })
            .options({
                stripUnknown: true,
            }),
    };

    return Joi.compile(listSchema).validate({
        query,
        headers,
    });
};

const validateMCQQuestion = (query, headers) => {
    const questionSchema = {
        query: Joi.object()
            .keys({
                id: Joi.string().required(),
            })
            .options({
                stripUnknown: true,
            }),
        headers: Joi.object()
            .keys({
                token: Joi.string(),
            })
            .options({
                stripUnknown: true,
            }),
    };

    return Joi.compile(questionSchema).validate({
        query,
        headers,
    });
};

const validateMCQreview = (body, headers) => {
    const reviewSchema = {
        body: Joi.object()
            .keys({
                id: Joi.string().required(),
                action: Joi.string().valid('approve', 'decline').required()
            })
            .options({
                stripUnknown: true,
            }),
        headers: Joi.object()
            .keys({
                token: Joi.string().required(),
            })
            .options({
                stripUnknown: true,
            }),
    };

    return Joi.compile(reviewSchema).validate({
        body,
        headers,
    });
};

module.exports = {
    validateMCQCreate,
    validateMCQList,
    validateMCQQuestion,
    validateMCQreview,
};
