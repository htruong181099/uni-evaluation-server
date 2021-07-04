const db = require("../model");

const Form = db.form;
const FormCriteria = db.formCriteria;
const FormDepartment = db.formDepartment;
const FormStandard = db.formStandard;
const FormUser = db.formUser;
const UserForm = db.userForm;

const Criteria = db.criteria;
const Standard = db.standard;

const EvaluateForm = db.evaluateForm;
const EvaluateCriteria = db.evaluateCriteria;
const EvaluateDescription = db.evaluateDescription;


const {body, param, query} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'classifyStandard': {
            return [
                param("fcode", "Invalid form").exists().isString(),
                query("scode", "Invalid standard").exists().isString()
            ]
        }
        case 'classifyStandards': {
            return [
                param("fcode", "Invalid form").exists().isString()
            ]
        }
        case 'saveEvaluation': {
            return [
                param("ufid", "Invalid ufid").exists().isMongoId(),
                body("dataToSend", "Invalid data").exists().isArray(),
                body("level", "Invalid level").exists().isNumeric()
            ]
        }
        case 'submitEvaluation': {
            return [
                param("ufid", "Invalid ufid").exists().isMongoId(),
                body("dataToSend", "Invalid data").exists().isArray(),
                body("level", "Invalid level").exists().isNumeric()
            ]
        }
    }
}

exports.getEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const formUser = await FormUser.findOne({
            user_id,
            form_id: userForm.form_id
        }).select("_id");

        if(!formUser){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        const evaluateForms = await EvaluateForm.find({
            // user: formUser._id,
            userForm: userForm._id,
            status: [0,1]
        }).select("_id status level point").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            }).select("form_criteria point read_only -_id")
            .populate({
                path: "form_criteria",
                select: "criteria_id criteria_order -_id",
                sort: {"criteria_order": 1},
                populate: {
                    path: "criteria_id",
                    select: "code -_id"
                }
            })
            evaluateForm.evaluateCriteria = evaluateCriteria;
        }
        

        return res.status(200).json({
            statusCode: 200,
            evaluateForms
        })


    } catch (error) {
        next(error);
    }
}

//Admin
exports.getEvaluationAdmin = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id point");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForms = await EvaluateForm.find({
            // user: formUser._id,
            userForm: userForm._id,
            status: [0,1]
        }).select("_id status point").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            }).select("form_criteria point level -_id")
            .populate({
                path: "form_criteria",
                select: "criteria_id criteria_order -_id",
                sort: {"criteria_order": 1},
                populate: {
                    path: "criteria_id",
                    select: "code -_id"
                }
            })
            evaluateForm.evaluateCriteria = evaluateCriteria;
        }
        

        return res.status(200).json({
            statusCode: 200,
            evaluateForms
        })


    } catch (error) {
        next(error);
    }
}


//version 2
//save Evaluation
exports.saveEvaluationV2 = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id,
            level
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        const body = dataToSend;
        for(let i in body){
            const criteria = await Criteria.findOne({
                code: body[i].name,
                isDeleted: false
            }).select("_id type")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:null
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:null;
            if(criteria.type == 'checkbox'){
                evaluateCriteria.point = body[i].value?body[i].value:0;
            }
            await evaluateCriteria.save();
        }
        evaluateForm.status = 0;
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }
}

//version 3
exports.submitEvaluationV3 = async (req,res,next)=>{
    try {        
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id form_user");        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }
        const form_id = userForm.form_id;
        if(level == 2 || level == 3){
            const formDepartment = await FormDepartment.findOne({
                form_id,
                level,
                head: user_id,
                isDeleted: false
            }).lean()
            if(!formDepartment){
                return res.status(403).json({
                    statusCode: 403,
                    message: "Required head role"
                })
            }
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id,
            level
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        
        const body = dataToSend;
        for(let i in body){
            const criteria = await Criteria.findOne({
                code: body[i].name,
                isDeleted: false
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:0,
                })
            }
            let point = body[i].value?body[i].value:0;
            point = formCriteria.point?(point>formCriteria.point? formCriteria.point:point):point;
            evaluateCriteria.point = body[i].value?body[i].value:0;
            await evaluateCriteria.save();
        }
        evaluateForm.status = 1;

        //calculate point
        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).sort({standard_order: 1})
        .select("standard_id standard_order standard_point")
        .populate("standard_id", "code name")

        let final_point = 0;
        for(let i in formStandards){
            const formStandard = formStandards[i];
            const formCriterias = await FormCriteria.find({
                form_standard: formStandard._id,
                isDeleted: false
            }).select("_id")
            const evaluateCriterias = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriterias
            })
            .select("-__v -isDeleted")
            
            let standard_point = evaluateCriterias.reduce((acc,ele) => acc + ele.point, 0)
            if(formStandard.standard_point){
                standard_point = (standard_point > formStandard.standard_point)? formStandard.standard_point: standard_point
            } 
            final_point += standard_point;
        }
        //--end calculate point

        evaluateForm.point = final_point;
        await evaluateForm.save();
        
        res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
        
        req.form_id = userForm.form_id;
        req.formUser_id = userForm.form_user;
        req.level = level;
        req.userForm_id = userForm._id;
        req.fbody = body;
        next();
        
    } catch (error) {
        next(error);
    }
}

exports.cloneEvaluateCriteria = async (req,res,next)=>{
    try {
        const {form_id, level, userForm_id, fbody, formUser_id} = req;
        const body = fbody;
        //get formdepartment level + 1
        
        let formDepartment;
        if(level == 1){
            const formUser = await FormUser.findOne({
                _id: formUser_id,
                isDeleted: false
            })
            formDepartment = await FormDepartment.findOne({
                _id: formUser.department_form_id,
                form_id: form_id,
                level: level + 1,
                isDeleted: false
            })
        }
        else if(level >= 2){
            formDepartment = await FormDepartment.findOne({
                form_id: form_id,
                level: level + 1,
                isDeleted: false
            }).select("_id head")
        }

        if(!formDepartment){
            const userForm = await UserForm.findOne({
                _id: userForm_id
            })
            const evaluateForm = await EvaluateForm.findOne({
                userForm: userForm._id,
                status: 1
            }).sort({
                "level": -1
            })
    
            userForm.point = evaluateForm.point;
            userForm.save();
            return;
        }

        //head formuser
        const upperLevelHead = await FormUser.findOne({
            isDeleted: false,
            department_form_id: formDepartment._id,
            user_id: formDepartment.head
        }).select("_id")

        //clone head evaluate form
        const evaluateForm = new EvaluateForm({
            user: upperLevelHead._id,
            userForm: userForm_id,
            status: 0,
            level: level + 1
        })

        const doc = await evaluateForm.save();

        for(let criteriaObj of body){
            const criteria = await Criteria.findOne({
                code: criteriaObj.name,
                isDeleted: false
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: doc._id,
                form_criteria: formCriteria._id,
                level: level+1
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: doc._id,
                    form_criteria: formCriteria._id,
                    point: criteriaObj.value?criteriaObj.value:0,
                    level: level+1
                })
            }
            evaluateCriteria.point = criteriaObj.value?criteriaObj.value:0;
            const saved = await evaluateCriteria.save();

            if(criteriaObj.details && criteriaObj.details.length != 0){
                for(detail of criteriaObj.details){
                    const evaluateDescription = new EvaluateDescription({
                        evaluateCriteria: saved._id,
                        name: detail.name,
                        value: detail.value,
                        description: detail.description
                    })
                    evaluateDescription.save();
                }
            }
            
        }

    } catch (error) {
        next(error);
    }
}

//delete Evaluate Form DB
exports.deleteEvaluateFormDB = async (req,res,next)=>{
    try {
        const {id} = req.params;

        const evaluateForm = await EvaluateForm.findById(id);
        EvaluateCriteria.deleteMany({
            evaluateForm: evaluateForm._id
        },{},()=>{
            EvaluateForm.deleteOne({_id: id},{},()=>{
                return res.status(200).json({
                    statusCode: 200,
                    message: "Success"
                })
            })
        })

    } catch (error) {
        next(error);
    }
}

//phân loại theo tiêu chuẩn
exports.classifyStandard = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {scode} = req.query;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        }).select("_id")
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard._id,
            isDeleted: false
        })
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        const formCriterias = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        }).select("_id")

        EvaluateCriteria.aggregate([{
            $match: { // find all evaluate criteria of a standard
                form_criteria: {$in: formCriterias.map(e=>e._id)}
            },
        },{ //group same evaluateForm -> sum point
            $group: {
                _id: "$evaluateForm",
                evalform: {$first: "$evaluateForm"},
                point: {$sum: "$point"}
            },
        },{ //populate evaluateForm
            $lookup: {
                from: "evaluateforms",
                localField: "evalform",
                foreignField: "_id",
                as: "evaluateForm"
            }
        },{ //select point & filter evaluateForm which level == 3
            $project: {
                point: 1,
                evaluateForm: {
                    $filter: {
                        input: "$evaluateForm", 
                        as: "evaluateForm", 
                        cond: { $eq: [ "$$evaluateForm.level", 3 ] } 
                    }
                }
            }
        },{ //convert array -> obj
            $unwind: "$evaluateForm"
        },{ //populate userForm
            $lookup: {
                from: "userforms",
                localField: "evaluateForm.userForm",
                foreignField: "_id",
                as: "userForm"
            }
        },{ //convert array -> obj
            $unwind: "$userForm"
        },{ //populate formUser
            $lookup: {
                from: "formusers",
                localField: "userForm.form_user",
                foreignField: "_id",
                as: "formUser"
            }
        },{ //convert array -> obj
            $unwind: "$formUser"
        },{ //populate User
            $lookup: {
                from: "users",
                localField: "formUser.user_id",
                foreignField: "_id",
                as: "user"
            }
        },{ //convert array -> obj
            $unwind: "$user"
        },{ //select point && user
            $project: {
                point: 1,
                user: {
                    staff_id: 1,
                    lastname: 1,
                    firstname: 1
                }
            }
        }
        ,{
            $sort: {"point": -1}
        }
        ],(err,docs)=>{
            res.status(200).json({
                statusCode: 200,
                standard_points: docs
            })
            return;
        })
        
        // console.log(evaluateCriteria);

    } catch (error) {
        next(error);
    }
}

exports.classifyStandards = async (req,res,next)=>{
    try {
        const {fcode} = req.params;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formStandards = await FormStandard.find({
            form_id: form._id,
            isDeleted: false
        })
        if(!formStandards){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        const formCriterias = await FormCriteria.find({
            form_standard: formStandards,
            isDeleted: false
        }).select("_id")

        EvaluateCriteria.aggregate([{
            $match: { // find all evaluate criteria of a standard
                form_criteria: {$in: formCriterias.map(e=>e._id)}
            },
        },
        { //populate formcriteria
            $lookup: {
                from: "formcriterias",
                localField: "form_criteria",
                foreignField: "_id",
                as: "formCriteria"
            }
        },
        { //group by formStandard and evaluateForm
            $group: {
                _id: {
                    formStandard: "$formCriteria.form_standard",
                    evaluateForm: "$evaluateForm"
                },
                evalform: {$first: "$evaluateForm"},
                formStandard: {$first: "$formCriteria.form_standard"},
                point: {$sum: "$point"}
            },
        },
        { //convert array -> obj
            $unwind: "$_id.formStandard",
        },
        { //populate formStandard
            $lookup: {
                from: "formstandards",
                localField: "formStandard",
                foreignField: "_id",
                as: "formStandard"
            }
        },
        { //convert array -> obj
            $unwind: "$formStandard",
        },
        { //sort by standard_order
            $sort: {"formStandard.standard_order": 1}
        },
        { //populate standard
            $lookup: {
                from: "standards",
                localField: "formStandard.standard_id",
                foreignField: "_id",
                as: "standard"
            }
        },
        {
            $unwind: "$standard",
        },
        { //populate evaluateForm
            $lookup: {
                from: "evaluateforms",
                localField: "evalform",
                foreignField: "_id",
                as: "evaluateForm"
            }
        },
        { //select point & filter evaluateForm which level == 3
            $project: {
                point: 1,
                evaluateForm: {
                    $filter: {
                        input: "$evaluateForm", 
                        as: "evaluateForm", 
                        cond: { $and: [
                            {$eq: [ "$$evaluateForm.level", 3 ] } ,
                            {$eq: [ "$$evaluateForm.status", 1 ] }
                        ]}
                    }
                },
                formStandard: {
                    standard_order: 1,
                    standard_point: 1
                },
                standard: {
                    code: 1,
                }
            }
        },
        { //convert array -> obj
             $unwind: "$evaluateForm"
        },
        { //populate userForm
            $lookup: {
                from: "userforms",
                localField: "evaluateForm.userForm",
                foreignField: "_id",
                as: "userForm"
            }
        },
        { //convert array -> obj
            $unwind: "$userForm"
        },
        { //populate formUser
            $lookup: {
                from: "formusers",
                localField: "userForm.form_user",
                foreignField: "_id",
                as: "formUser"
            }
        },
        { //convert array -> obj
            $unwind: "$formUser"
        },
        { //populate User
            $lookup: {
                from: "users",
                localField: "formUser.user_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { //convert array -> obj
            $unwind: "$user"
        },
        { //select point && user
            $project: {
                point: 1,
                formStandard: 1,
                standard: 1,
                user: {
                    staff_id: 1,
                    lastname: 1,
                    firstname: 1
                },
                evaluateForm: {
                    point: 1
                } 
            }
        },
        { //group by
            $group: {
                _id: "$user",
                standards: {$push: {
                    order: "$formStandard.standard_order",
                    standard: "$standard.code",
                    point: "$point",
                    max_point: "$formStandard.standard_point"
                }},
                final_point: {
                    $first: "$evaluateForm.point"
                },
            },
        },
        {
            $sort: {
                "_id.firstname": 1,
                "_id.staff_id": 1
            }
        }
        ],(err,docs)=>{
            res.status(200).json({
                statusCode: 200,
                standard_points: docs
            })
            return;
        })
        
        // console.log(evaluateCriteria);

    } catch (error) {
        next(error);
    }
}

exports.test = async (req,res,next)=>{
    const userForm_id = req.params.ufid;
    try {
        const userForm = await UserForm.findOne({
            _id: userForm_id
        })
        const form_id = userForm.form_id;
        const evaluateForm = await EvaluateForm.findOne({
            userForm: userForm._id,
            status: 1
        }).sort({
            "level": -1
        })

        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).sort({standard_order: 1})
        .select("standard_id standard_order standard_point")
        .populate("standard_id", "code name")


        let lst = []
        let final_point = 0;
        for(let i in formStandards){
            const formStandard = formStandards[i];
            const formCriterias = await FormCriteria.find({
                form_standard: formStandard._id,
                isDeleted: false
            }).select("_id")
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriterias
            }).populate({
                path: "form_criteria",
                select: "form_standard criteria_id criteria_order point -_id",
                sort: {criteria_order: 1},
                populate: {
                    path: "criteria_id",
                    select: "code name type -_id",
                }
            })
            .select("-__v -isDeleted")
            let standard_point = evaluateCriteria.reduce((acc,ele) => acc + ele.point, 0)
            
            lst.push({
                formStandard,
                evaluateCriteria,
                count: evaluateCriteria.length,
                standard_point
            })
            if(formStandard.standard_point){
                standard_point = standard_point > formStandard.standard_point? formStandard.standard_point: standard_point
            } 
            final_point += standard_point;
        }

        res.status(200).json({
            final_point,
            lst
        })
        return;
    } catch (error) {
        next(error);
    }
}

//newest
//save Evaluation
exports.saveEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;

        //query userform && formuser
        const userForm = await UserForm.findById(ufid).select("_id form_id form_user");
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }
        const user = await FormUser.findOne({user_id, form_id: userForm.form_id, isDeleted: false}).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        //check head
        const form_id = userForm.form_id;
        if(level == 2 || level == 3){
            const formDepartment = await FormDepartment.findOne({
                form_id,
                level,
                head: user_id,
                isDeleted: false
            }).lean()
            if(!formDepartment){
                return res.status(403).json({
                    statusCode: 403,
                    message: "Required head role"
                })
            }
        }

        //query evaluateForm
        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id,
            level
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        //return 400 error if form had been submitted
        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        
        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).sort({standard_order: 1})
        .select("_id standard_id standard_order standard_point")
        .populate("standard_id", "code name")

        const body = dataToSend;
        console.log(dataToSend);
        for(let criteriaObj of body){
            const criteria = await Criteria.findOne({
                code: criteriaObj.name,
                isDeleted: false
            }).select("_id type")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                form_standard: formStandards.map(e=>e._id),
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id
            })
            if(evaluateCriteria && evaluateCriteria.read_only == true){
                continue;
            }

            let ECPoint = criteriaObj.value?criteriaObj.value:0;
            const ec_max_point = formCriteria.point;
            ECPoint = ec_max_point?(ECPoint<ec_max_point? ECPoint: ec_max_point):ECPoint;

            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: ECPoint
                })
                
            }
            evaluateCriteria.point = ECPoint
            const saved = await evaluateCriteria.save();

            if(criteriaObj.details && criteriaObj.details.length != 0){
                switch (criteria.type) {
                    case "number": {
                        for(detail of criteriaObj.details){
                            let evaluateDescription = await EvaluateDescription.findOne({
                                evaluateCriteria: saved._id,
                            })
                            if(!evaluateDescription){
                                evaluateDescription = new EvaluateDescription({
                                    evaluateCriteria: saved._id,
                                    name: detail.name,
                                    value: detail.value,
                                    description: detail.description
                                })
                            }
                            evaluateDescription.name= detail.name;
                            evaluateDescription.value= detail.value;
                            evaluateDescription.description= detail.description;
                            await evaluateDescription.save();
                        }
                    }
                    case "detail": {
                        const deleted = await EvaluateDescription.deleteMany({
                            evaluateCriteria: saved._id,
                        })
                        for(detail of criteriaObj.details){
                            const evaluateDescription = new EvaluateDescription({
                                evaluateCriteria: saved._id,
                                name: detail.name,
                                value: detail.value,
                                description: detail.description
                            })
                            await evaluateDescription.save();
                        }
                    }
                }
            }
        }
        evaluateForm.status = 0;
        evaluateForm.uptime = new Date();
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }
}

//submit Evaluation
exports.submitEvaluation = async (req,res,next)=>{
    try {        
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;

        //query userform && formuser
        const userForm = await UserForm.findById(ufid).select("_id form_id form_user");
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }
        const user = await FormUser.findOne({user_id, form_id: userForm.form_id, isDeleted: false}).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        //check head
        const form_id = userForm.form_id;
        if(level == 2 || level == 3){
            const formDepartment = await FormDepartment.findOne({
                form_id,
                level,
                head: user_id,
                isDeleted: false
            }).lean()
            if(!formDepartment){
                return res.status(403).json({
                    statusCode: 403,
                    message: "Required head role"
                })
            }
        }

        //query evaluateForm
        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id,
            level
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        //return 400 error if form had been submitted
        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        
        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).sort({standard_order: 1})
        .select("_id standard_id standard_order standard_point")
        .populate("standard_id", "code name")

        const body = dataToSend;
        console.log(dataToSend);
        for(let criteriaObj of body){
            const criteria = await Criteria.findOne({
                code: criteriaObj.name,
                isDeleted: false
            }).select("_id type")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                form_standard: formStandards.map(e=>e._id),
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id
            })
            if(evaluateCriteria && evaluateCriteria.read_only == true){
                continue;
            }

            let ECPoint = criteriaObj.value?criteriaObj.value:0;
            const ec_max_point = formCriteria.point;
            ECPoint = ec_max_point?(ECPoint<ec_max_point? ECPoint: ec_max_point):ECPoint;

            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: ECPoint
                })
                
            }
            evaluateCriteria.point = ECPoint
            const saved = await evaluateCriteria.save();

            if(criteriaObj.details && criteriaObj.details.length != 0){
                switch (criteria.type) {
                    case "number": {
                        for(detail of criteriaObj.details){
                            let evaluateDescription = await EvaluateDescription.findOne({
                                evaluateCriteria: saved._id,
                            })
                            if(!evaluateDescription){
                                evaluateDescription = new EvaluateDescription({
                                    evaluateCriteria: saved._id,
                                    name: detail.name,
                                    value: detail.value,
                                    description: detail.description
                                })
                            }
                            evaluateDescription.name= detail.name;
                            evaluateDescription.value= detail.value;
                            evaluateDescription.description= detail.description;
                            await evaluateDescription.save();
                        }
                    }
                    case "detail": {
                        const deleted = await EvaluateDescription.deleteMany({
                            evaluateCriteria: saved._id,
                        })
                        for(detail of criteriaObj.details){
                            const evaluateDescription = new EvaluateDescription({
                                evaluateCriteria: saved._id,
                                name: detail.name,
                                value: detail.value,
                                description: detail.description
                            })
                            await evaluateDescription.save();
                        }
                    }
                }
            }
        }

        //calculate point
        let final_point = 0;
        for(let i in formStandards){
            const formStandard = formStandards[i];
            const formCriterias = await FormCriteria.find({
                form_standard: formStandard._id,
                isDeleted: false
            }).select("_id")

            const evaluateCriterias = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriterias.map(e=>e._id)
            })
            .select("-__v -isDeleted")
            
            let standard_point = evaluateCriterias.reduce((acc,ele) => acc + ele.point, 0)
            if(formStandard.standard_point){
                standard_point = (standard_point > formStandard.standard_point)? formStandard.standard_point: standard_point
            } 
            final_point += standard_point;
        }
        //--end calculate point
        evaluateForm.status = 1;
        evaluateForm.uptime = new Date();
        evaluateForm.point = final_point;
        await evaluateForm.save();
        
        res.status(200).json({
            statusCode: 200,
            message: "Submit evaluation successfully"
        })
        
        req.form_id = userForm.form_id;
        req.formUser_id = userForm.form_user;
        req.level = level;
        req.userForm_id = userForm._id;
        req.previousEvaluateForm = evaluateForm._id;
        next();
        
    } catch (error) {
        next(error);
    }
}

//get Evaluation
exports.getEvaluationV2 = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const formUser = await FormUser.findOne({
            user_id,
            form_id: userForm.form_id
        }).select("_id");

        if(!formUser){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        const evaluateForms = await EvaluateForm.find({
            userForm: userForm._id,
            status: [0,1]
        }).select("_id status level point").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            })
            .lean()
            .select("form_criteria point read_only")
            .populate({
                path: "form_criteria",
                select: "criteria_id criteria_order _id",
                sort: {"criteria_order": 1},
                populate: {
                    path: "criteria_id",
                    select: "code"
                }
            })
    
            for(ec of evaluateCriteria){
                ec.details = await EvaluateDescription.find({
                    evaluateCriteria: ec._id
                }).lean().select("-evaluateCriteria -__v")
            }
            evaluateForm.evaluateCriteria = evaluateCriteria;
        }
        

        return res.status(200).json({
            statusCode: 200,
            evaluateForms
        })


    } catch (error) {
        next(error);
    }
}

//clone Evaluation
exports.cloneEvaluateCriteriaV2 = async (req,res,next)=>{
    try {
        const {form_id, level, userForm_id, formUser_id, previousEvaluateForm} = req;
        //get formdepartment level + 1
        
        let formDepartment;
        if(level == 1){
            const formUser = await FormUser.findOne({
                _id: formUser_id,
                isDeleted: false
            })
            formDepartment = await FormDepartment.findOne({
                _id: formUser.department_form_id,
                form_id: form_id,
                level: level + 1,
                isDeleted: false
            })
        }
        else if(level >= 2){
            formDepartment = await FormDepartment.findOne({
                form_id: form_id,
                level: level + 1,
                isDeleted: false
            }).select("_id head")
        }

        if(!formDepartment){
            const userForm = await UserForm.findOne({
                _id: userForm_id
            })
            const evaluateForm = await EvaluateForm.findOne({
                userForm: userForm._id,
                status: 1
            }).sort({
                "level": -1
            })
    
            userForm.point = evaluateForm.point;
            userForm.save();
            return;
        }

        //head formuser
        const upperLevelHead = await FormUser.findOne({
            isDeleted: false,
            department_form_id: formDepartment._id,
            user_id: formDepartment.head
        }).select("_id")

        //clone head evaluate form
        const evaluateForm = new EvaluateForm({
            user: upperLevelHead._id,
            userForm: userForm_id,
            status: 0,
            level: level + 1
        })

        //new upperlevel evaluateForm
        const doc = await evaluateForm.save();

        //find all previous evaluateCriteria
        const previousEvaluateCriterias = await EvaluateCriteria.find({
            evaluateForm: previousEvaluateForm
        })
        
        const previousEvaluateDescriptions = await EvaluateDescription.find({
            evaluateCriteria: previousEvaluateCriterias.map(e=>e._id)
        })
        //maping EvaluateDescriptions
        let mapping = {}
        previousEvaluateDescriptions.forEach(evaluateDescription => {
            mapping[evaluateDescription.evaluateCriteria.toString()]
                = !mapping[evaluateDescription.evaluateCriteria.toString()]
                ? [evaluateDescription]
                : [...mapping[evaluateDescription.evaluateCriteria.toString()], evaluateDescription]
        })

        for(let evaluateCriteriaObj of previousEvaluateCriterias){
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: doc._id,
                form_criteria: evaluateCriteriaObj.form_criteria,
                level: level+1
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: doc._id,
                    form_criteria: evaluateCriteriaObj.form_criteria,
                    point: evaluateCriteriaObj.point,
                    level: level+1
                })
            }

            evaluateCriteria.point = evaluateCriteriaObj.point;
            if(evaluateCriteriaObj.read_only){
                evaluateCriteria.read_only = true;
            }
            
            const saved = await evaluateCriteria.save();

            let evaluateDescriptions = mapping[evaluateCriteriaObj._id]?mapping[evaluateCriteriaObj._id]:[];
            if(evaluateDescriptions){
                const descriptionData = evaluateDescriptions.map(evaluateDescription => {
                    const {name, value, description} = evaluateDescription;
                    return {
                        evaluateCriteria: saved._id,
                        name, value, description
                    }
                })
                EvaluateDescription.insertMany(descriptionData)
            }
            
            
        }

    } catch (error) {
        next(error);
    }
}