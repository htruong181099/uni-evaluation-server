const db = require("../model");
const Form = db.form;
const FormStandard = db.formStandard;
const FormCriteria = db.formCriteria;
const EvaluationReview = db.evaluationReview;
const FormType = db.formType;
const CriteriaOption = db.criteriaOption;
const UserForm = db.userForm;

const {body, param, query, validationResult} = require("express-validator");
const FormUser = require("../model/formUser.model");


exports.validate = (method)=>{
    switch(method){
        case 'addForm': {
            return [
                param("rcode","Invalid Review ID").exists().isString(),
                param("ftcode","Invalid Form type ID").exists().isString(),
                body("code","Invalid code input").exists().isString(),
                body("name","Invalid name input").exists().isString()
            ]
        }
        case 'getForm': {
            return [
                param("id","Invalid Form ID").exists().isMongoId()
            ]
        }
        case 'getFormfromFormTypeandReview': {
            return [
                param("rcode","Invalid Review ID").exists().isString(),
                param("ftcode","Invalid Form type ID").exists().isString(),
            ]
        }
        case 'getUserForms': {
            return [
                param("rcode","Invalid Review Code").exists().isString()
            ]
        }
        case 'getEvaForm': {
            return [
                param("fcode","Invalid FormCode").exists().isString()
            ]
        }
        case 'getEvaFormbyID': {
            return [
                param("fid","Invalid FormID").exists().isMongoId()
            ]
        }
    }
}

exports.addForm = async (req,res,next)=>{
    try {
        const {rcode, ftcode} = req.params;
        const {code, name} = req.body;

        const review = await EvaluationReview.findOne({code: rcode}).select("_id");
        const type = await FormType.findOne({code: ftcode}).select("_id");
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found!"
            })
        }
        if(!type){
            return res.status(404).json({
                statusCode: 404,
                message: "Form type not found!"
            })
        }

        const form = new Form({
            code,
            name,
            type: type._id,
            review: review._id
        })
        form.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({message: 'Evaluation Review already exists!'});
                }
                return next(err);
            }
            return res.status(200).json({
                message: "Add Form successfully"
            })
        })
    } catch (error) {
        next(error);
    }  

}

exports.getForm = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const form = await Form.findById(id)  
            .select("-__v");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            message: "success",
            form
        })
    } catch (error) {
        next(error);
    }
}


exports.getFormfromFormTypeandReview = async (req,res,next)=>{
    try {
        const {rcode, ftcode} = req.params;
        const review = await EvaluationReview.findOne({code: rcode}).select("_id");
        const type = await FormType.findOne({code: ftcode}).select("_id");
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found!"
            })
        }
        if(!type){
            return res.status(404).json({
                statusCode: 404,
                message: "Form type not found!"
            })
        }
        const form = await Form.findOne({
            review: review._id,
            type: type._id
        }).select("-__v");

        return res.status(200).json({
            statusCode: 200,
            message: "success",
            form
        })
    } catch (error) {
        next(error);
    }
}

// get forms belong to a review
exports.getUserForms = async (req,res,next)=>{
    try {
        const {rcode} = req.params;
        const review = await EvaluationReview.findOne({
            code: rcode
        }).select("_id");
        const forms = await Form.find({
            review: review._id,
            isDeleted: false
        }).select("_id");

        const formUsers = await FormUser.find({
            form_id: forms.map(form=>form._id),
            user_id: req.userId,
            isDeleted: false
        }).populate({
            path: "form_id",
            select: "code name type",
            populate: {
                path: "type",
                select: "-__v -isDeleted -_id"
            }
        })
        .populate({
            path: "department_form_id",
            select: "department_id level -_id",
            populate: {
                path: "department_id",
                select: "department_code name -_id"
            }
        })
        .select("form_id department_form_id -_id")
        .lean();

        for(let i in formUsers){
            const formUser = formUsers[i];
            let userForm = await UserForm.findOne({
                form_user: formUser._id,
                form_id: formUser.form_id._id
            });
            if(!userForm){
                userForm = new UserForm({
                    form_user: formUser._id,
                    form_id: formUser.form_id._id
                })
                await userForm.save();
            }
            formUser.userForm = userForm;
        }

        

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formUsers
        })

    } catch (error) {
        next(error);
    }
}

//get evaluation form using form code
exports.getEvaForm = async (req,res,next)=>{
    try {
        // const {fcode} = req.params;

        // const form = await Form.findOne({
        //     code: fcode,
        //     isDeleted: false
        // }).select("_id");
        // if(!form){
        //     return res.status(404).json({
        //         statusCode: 404,
        //         message: "Form not found"
        //     })
        // }
        const form_id = req.form_id;
        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).populate("standard_id", "code name description")
        .sort({"standard_order" : 1})
        .select("standard_id standard_order standard_point").lean();

        for(let i in formStandards){
            const formCriteria = await FormCriteria.find({
                form_standard: formStandards[i]._id,
                isDeleted: false
            }).populate("criteria_id","code name type description")
            .sort({"criteria_order": 1})
            .select("criteria_id criteria_order point").lean();
            for(let j in formCriteria){
                const options = await CriteriaOption.find({
                    criteria_id: formCriteria[j].criteria_id._id,
                    isDeleted: false
                })
                .sort({"max_point" : -1})
                .select("name max_point description")
                formCriteria[j].options = options;
            }
            
            formStandards[i].formCriteria = formCriteria;
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formStandards
        })

    } catch (error) {
        next(error);
    }
}

//get evaluation form using form id
exports.getEvaFormbyID= async (req,res,next)=>{
    try {
        const {fid} = req.params;

        const form = await Form.findOne({
            _id: fid,
            isDeleted: false
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formStandards = await FormStandard.find({
            form_id: form._id,
            isDeleted: false
        }).populate("standard_id", "code name description")
        .sort({"standard_order" : 1})
        .select("standard_id standard_order standard_point").lean();

        for(let i in formStandards){
            const formCriteria = await FormCriteria.find({
                form_standard: formStandards[i]._id,
                isDeleted: false
            }).populate("criteria_id","code name type description")
            .sort({"criteria_order": 1})
            .select("criteria_id criteria_order point -_id").lean();
            for(let j in formCriteria){
                const options = await CriteriaOption.find({
                    criteria_id: formCriteria[j].criteria_id._id,
                    isDeleted: false
                }).select("name max_point description -_id")
                .sort({"max_point" : -1})
                formCriteria[j].options = options;
            }
            
            formStandards[i].formCriteria = formCriteria;
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formStandards
        })

    } catch (error) {
        next(error);
    }
}