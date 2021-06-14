const db = require("../model/");
const FormRating = db.formRating;

//validator
const {body, param, query} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'getFormRating':{
            return [
                // param("fcode", "Invalid form").exists().isString(),
                param("id", "Invalid formRaing ID").exists().isMongoId()
            ]
        }
        case 'getFormRatings': {
            return [
                param("fcode", "Invalid form").exists().isString()
            ]
        }
        case 'addFormRating': {
            return [
                param("fcode", "Invalid form").exists().isString(),
                body("name").exists().isString(),
                body("min_point").optional().isNumeric(),
                body("max_point").optional().isNumeric(),
            ]
        }
    }
}

//get single formRating
exports.getFormRating = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const formRating = await FormRating.find({
            _id: id
        })
        .lean()
        .select("-__v")

        if(!formRating){
            return res.status(404).json({
                statusCode: 404,
                message: "FormRating not found"
            })
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formRating
        })
    } catch (error) {
        next(error);
    }
}

//get all formRatings of a form
exports.getFormRatings = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formRatings = await FormRating.find({
            form_id: form._id
        })
        .lean()
        .select("-__v")
        .sort({min_point: 1})

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formRatings
        })

    } catch (error) {
        next(error);
    }
}

//create new formRating
exports.addFormRating = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {name, min_point, max_point} = req.body;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formRating = new FormRating({
            form_id: form._id,
            name,
            min_point,
            max_point
        })

        formRating.save();

        return res.status(201).json({
            statusCode: 201,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}   