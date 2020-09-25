const { json } = require('express');
const jsonschema = require('jsonschema');
const ExpressError = require('./expressError');

const validateData = (data, schema, next) => {
    const result = jsonschema.validate(data, schema);

    if (!result.valid) {
        const errors = result.errors.map((e) => e.stack);
        const expressErr = new ExpressError(errors, 400);
        return next(expressErr);
    } else {
        return true;
    }
};

module.exports = validateData;
