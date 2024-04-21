const createError = require("http-errors");
const ValidatorMidd={}
ValidatorMidd.validateBody=(schema)=>{
    return (req, res, next) => {
        const validatorResult = schema.validate(req.body)
        if (validatorResult.error) {
            throw createError(validatorResult.error.details[0].message)
        } else {
            next()
        }
    }
}

module.exports=ValidatorMidd

