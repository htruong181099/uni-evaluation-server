const fs = require("fs");
const xlsx = require('xlsx');
const path = require("path");

//model
const db = require("../model/");
const Department = db.department;
const Criteria = db.criteria;
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const FormCriteria = db.formCriteria;
const Standard = db.standard;
const FormStandard = db.formStandard;
const User = db.user;
const Form = db.form;
const EvaluateCriteria = db.evaluateCriteria;

//constant
const ROOTDIR = path.dirname(require.main.filename);

//validator
const {body, param, query} = require("express-validator");
const EvaluateForm = require("../model/evaluateForm.model");
const UserForm = require("../model/userForm.model");
const EvaluateDescription = require("../model/evaluateDescription.model");

exports.validate = (method) =>{
    switch(method){
        case 'exportEvaluation':
        case 'importEvaluation':
        {
            return [
                param("fcode", "Invalid Form").exists().isString(),
                body("dcode", "Invalid Department").exists().isString(),
                body("scode", "Invalid Standard").exists().isString(),
                body("ccode", "Invalid Criteria").exists().isString()
            ]
        }
    }
}


//users files
exports.readExcelUser = async (req,res,next)=>{
    try {
        
        const filePath = (req.file&&req.file.path)?req.file.path:null;
        if(!filePath){
            return res.status(400).json({
                statusCode: 400,
                message: "File not found"
            })
        }
        
        const workbook = xlsx.readFile(filePath);
        const sheetNameList = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

        const departments = await Department.find({}).lean().select("_id department_code parent");
        let departments_id = {};
        departments.forEach(department=>{
            departments_id[department.department_code] = {
                _id: department._id.toString(),
                parent: department.parent?.toString()
            }
        })
        users = []
        for(row of xlData){
            user = {}
            for(key in row){
                switch(key){
                    case 'ID': {
                        user.staff_id = row[key];
                        break;
                    }
                    case 'Họ và tên lót': {
                        user.lastname = row[key];
                        break;
                    }
                    case 'Tên': {
                        user.firstname = row[key];
                        break;
                    }
                    case 'Ngày sinh': {
                        const birthday = row[key].split("/");
                        user.birthday = new Date(birthday[2],birthday[1],birthday[0]);
                        break;
                    }
                    case 'Giới tính': {
                        if(row[key]=="Nam"){
                            user.gender = "Male";
                            break;
                        }
                        else if(row[key]=="Nữ"){
                            user.gender = "Female";
                            break;
                        }
                        user.gender = "Other";
                        break;
                    }   
                    case 'Email': {
                        user.email = row[key];
                        break;
                    }
                    case 'SĐT':
                    case 'Phone':    
                    {
                        user.phone = row[key]=="0"?null:row[key];
                        break;
                    }
                    case 'Đơn vị':
                    case 'Department':    
                    {
                        if(row[key] == 0){
                            user.department = [];
                            break;
                        }
                        const dcodes = row[key].split(",")
                        let departments = [];
                        dcodes.forEach(dcode=>{
                            if(departments_id[dcode].parent){
                                departments = [...departments,departments_id[dcode]._id,departments_id[dcode].parent]
                                // departments.push(departments_id[dcode].parent)
                                // departments.push(departments_id[dcode]._id)
                            }
                            else{
                                departments = [...departments,departments_id[dcode]._id]
                            }
                        });
                        user.department = [...new Set(departments)]
                        break;
                    }
                }
            }
            user.password = bcrypt.hashSync("password", 8);
            users.push(user);
        }

        req.users = users;
        next();

    } catch (error) {
        next(error);
    }
}

exports.importUsers = async (req,res,next)=>{
    try {
        const users = req.users;
        const usersCount = users.length;
        User.insertMany(users, (err,doc)=>{
            if(err){
                console.error(err);
            }
            next();
        })
    } catch (error) {
        next(error);
    }
}


//--evaluations files
exports.readExcelEvaluateCriteria = async (req,res,next)=>{
    const filePath = (req.file&&req.file.path)?req.file.path:null;
    try {
        const {fcode} = req.params;
        const {dcode, scode, ccode} = req.body;

        if(!filePath){
            return res.status(404).json({
                statusCode: 404,
                message: "File not found"
            })
        }

        //read excel file -> parse to JSON
        const workbook = xlsx.readFile(filePath);
        const sheetNameList = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

        //if criteria code from excel not match ccode -> return error
        if(xlData[0]["Mã tiêu chí"] != ccode){
            res.status(400).json({
                statusCode: 400,
                message: "Criteria code Mismatch"
            })
            fs.unlinkSync(filePath);
            return;
        }

        //query form, standard, criteria
        const [form, department, standard, criteria] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id"),
            Standard.findOne({code: scode}).select("_id"),
            Criteria.findOne({code: ccode}).select("-__v")
        ])
        
        //return 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404, 
                message: "Form not found"
            })
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404, 
                message: "Department not found"
            })
        }
        if(!standard){
            return res.status(404).json({
                statusCode: 404, 
                message: "Standard not found"
            })
        }
        if(!criteria){
            return res.status(404).json({
                statusCode: 404, 
                message: "Criteria not found"
            })
        }

        //query formStandard
        const [formStandard, formDepartment] = await Promise.all([
            FormStandard.findOne({
                form_id: form._id,
                standard_id: standard._id
            }).select("_id"),
            FormDepartment.findOne({
                form_id: form._id,
                department_id: department._id
            }).select("_id")
        ])

        if(!formStandard){
            return res.status(404).json({
                statusCode: 404, 
                message: "Form Criteria not found"
            })
        }

        //query formCriteria
        const [formCriteria, formUsers]= await Promise.all([
            FormCriteria.findOne({
                form_standard: formStandard._id,
                criteria_id: criteria._id,
                isDeleted: false
            }).select("-__v"),
            FormUser.find({
                department_form_id: formDepartment._id,
                form_id: form._id,
                isDeleted: false
            }).lean()
            .select("_id user_id")
            .populate("user_id", "staff_id")
        ]) 

        if(!formCriteria){
            return res.status(404).json({
                statusCode: 404, 
                message: "Form Criteria not found"
            })
        }

        //query userForms
        const userFormWriteResult = await UserForm.bulkWrite(
            formUsers.map((formUser)=>({
                updateOne: {
                    filter: {
                        form_id: form._id, 
                        form_user: formUser._id
                    },
                    update: {
                        form_id: form._id,
                        point: null
                    },
                    upsert: true
                }
            }))
        )
        console.log(userFormWriteResult);

        const userForms = await UserForm.find({
            form_user: formUsers.map(e=>e._id),
            form_id: form._id
        }).lean()
        .select("_id form_user")
        

        //query EvaluationForms
        const evaluateFormWriteResult = await EvaluateForm.bulkWrite(
            userForms.map((userForm)=>({
                updateOne: {
                    filter: {
                        userForm: userForm._id,
                        user: userForm.form_user,
                        level: 1
                    },
                    update: {
                        status: 0,
                        uptime: null
                    },
                    upsert: true
                }
            }))
        )
        console.log(evaluateFormWriteResult);

        const evaluateForms = await EvaluateForm.find({
            userForm: userForms,
            user: formUsers,
            level: 1
        }).lean().select("_id userForm")

        //dictionary mapping
        const formUsersMap = {};
        formUsers.forEach(formUser=>{
            formUsersMap[formUser.user_id.staff_id] = formUser._id
        })
        const userFormsMap = {}
        userForms.forEach(userForm => {
            userFormsMap[userForm.form_user] = userForm._id
        })
        const evaluateFormsMap = {}
        evaluateForms.forEach(evaluateForm => {
            evaluateFormsMap[evaluateForm.userForm] = evaluateForm._id
        })

        //data
        const data = {
            formUsersMap,
            userFormsMap,
            evaluateFormsMap,
            formCriteria
        }

        let evaluateCriterias = excelToImportJSON(xlData, criteria.type, data);

        req.evaluateForms = evaluateForms;
        req.evaluateCriterias = evaluateCriterias;
        req.criteriaType = criteria.type;
        next();

    } catch (error) {
        next(error);
        fs.unlinkSync(filePath)
    }
}

exports.importEvaluations = async (req,res,next)=>{
    try {
        const evaluateCriterias = req.evaluateCriterias;
        const evaluateForms = req.evaluateForms;
        const criteriaType = req.criteriaType;
        const writeResult = await EvaluateCriteria.bulkWrite(
            evaluateCriterias.map(evaluateCriteria => ({
                updateOne: {
                    filter: {
                        evaluateForm: evaluateCriteria.evaluateForm,
                        form_criteria: evaluateCriteria.form_criteria
                    },
                    update: {
                        point: evaluateCriteria.point,
                        read_only: true
                    },
                    upsert: true
                }
            }))
        )
        console.log(writeResult);

        const docs = await EvaluateCriteria.find({evaluateForm: evaluateForms.map(e=>e._id)});
        //if criteria type is number or detail -> add descriptions
        if(docs && ['number', 'detail'].includes(criteriaType)){
            docsMap = {}
            docs.forEach(doc => {
                docsMap[doc.evaluateForm.toString()] = {
                    _id: doc._id,
                    form_criteria : doc.form_criteria
                }
            })
            
            evaluateDescriptions = []
            console.log(evaluateCriterias);
            evaluateCriterias.forEach(evaluateCriteria => {
                const {value, name, description} = evaluateCriteria.description;
                if(evaluateCriteria.evaluateForm){
                    evaluateDescription = {
                        evaluateCriteria: docsMap[evaluateCriteria.evaluateForm]._id,
                        value,
                        name,
                        description
                    }
                    evaluateDescriptions.push(evaluateDescription)
                }
            })

            const evaluateDescriptionWriteResult = await EvaluateDescription.bulkWrite(
                evaluateDescriptions.map(evaluateDescription => ({
                    updateOne: {
                        filter: {
                            evaluateCriteria: evaluateDescription.evaluateCriteria
                        },
                        update: {
                            value: evaluateDescription.value
                        },
                        upsert: true
                    }
                }))
            )
            console.log(evaluateDescriptionWriteResult);
        }

        req.doc = docs
        next();

    } catch (error) {
        next(error);
    }
}

exports.createFile = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcode, scode, ccode} = req.body;

        const [form, department, standard, criteria] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id"),
            Standard.findOne({code: scode}).select("_id"),
            Criteria.findOne({code: ccode}).select("-__v")
        ])

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            })
        }

        if(['radio','detail'].includes(criteria.type)){
            return res.status(405).json({
                statusCode: 405,
                message: "Criteria type is not supported"
            })
        }

        const [formDepartment, formStandard] = await Promise.all([
            FormDepartment.findOne({
                form_id: form._id,
                department_id: department._id,
                isDeleted: false
            }),
            FormStandard.findOne({
                standard_id: standard._id,
                form_id: form._id,
            }).select("_id")
        ])

        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "FormDepartment not found"
            })
        }
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        const [formUsers, formCriteria] = await Promise.all([
            FormUser.find({
                department_form_id: formDepartment._id,
                isDeleted: false
            }).lean().select("-_id -__v -isDeleted")
            .populate("user_id", "staff_id firstname lastname"),
            FormCriteria.findOne({
                criteria_id: criteria._id,
                form_standard: formStandard._id
            }).lean().select("-isDeleted, -__v")
        ])

        if(!formCriteria){
            return res.status(404).json({
                statusCode: 404,
                message: "FormCriteria not found"
            })
        }

        const body = {
            formUsers,
            criteria,
            formCriteria
        }
        let data = jsonToExcelData(body, criteria.type);

        let wb = xlsx.utils.book_new();
        const dataSheet = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb, dataSheet)
        // xlsx.utils.sheet_add_json(wb, data, {
        //     header: ["MSVC", "Mã tiêu chí","Tên tiêu chí","Điểm/lần",
        //     "Điểm tối đa","Số lần","Điểm"]
        // });
        
        xlsx.writeFile(wb, `./public/files/${dcode}-${ccode}.xlsx`);
        const filePath = `${ROOTDIR}/public/files/${dcode}-${ccode}.xlsx`;
        
        //res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        req.filePath = filePath;
        next();
    } catch (error) {
        next(error);
    }
}

//--departments files
exports.importDepartments = async (req,res,next)=>{
    try {
        const departments = req.departments;
        const departmentsCount = departments.length;
        Department.insertMany(departments, (err,doc)=>{
            if(err){
                console.error(err);
            }
            console.log(doc)
            console.log(departmentsCount)
            next();
        })
    } catch (error) {
        next(error);
    }
}

//--file utils
exports.getTemplate = (req, res, next)=>{
    try {
        const {file} = req.query;
        let filePath = `${ROOTDIR}/public/files/template/`;
        switch(file){
            case 'user': {
                filePath = `${ROOTDIR}/public/files/template/User_template.xlsx`;
                req.filePath = filePath;
                break;
            }
            case 'department': {
                filePath = `${ROOTDIR}/public/files/template/Department_template.xlsx`;
                req.filePath = filePath;
                break;
            }
        }
        req.filePath = filePath;
        next();
    } catch (error) {
        next(error);
    }
}

exports.download = async (req,res,next)=>{
    try {
        const filePath = req.filePath;
        res.download(filePath);
    } catch (error) {
        next(error)
    }
    
}

exports.downloadAndDelete = async (req,res,next)=>{
    const filePath = req.filePath;
    try {
        res.download(filePath, (err)=>{
            if(err){console.err(err)}
            fs.unlinkSync(filePath)
        })
        
    } catch (error) {
        next(error)
        fs.unlinkSync(filePath)
    }
}

exports.deleteFile = async (req,res,next)=>{
    try {
        fs.unlinkSync(req.file.path)
        return res.status(201).json({
            statusCode: 201,
            message: "Success"
        })
    } catch (error) {
        next(error);
    }
}

exports.removeFile = async (req,res,next)=>{
    try {
        const filePath = req.filePath;
        fs.unlinkSync(filePath);
    } catch (error) {
        next(error);
    }
}
//------------>


//utils
const excelToImportJSON = (xlData, type, data) => {
    const {formCriteria, formUsersMap, userFormsMap, evaluateFormsMap} = data;
    switch(type){
        case 'number': {
            let evaluateCriterias = []
            for(row of xlData){
                let evaluateCriteriaObj = {}
                evaluateCriteriaObj.description = {}
                for(key in row){
                    switch(key){
                        case 'MSVC': {
                            const staff_id = row[key];
                            const formUser = formUsersMap[staff_id];
                            const userForm = userFormsMap[formUser];
                            const evaluateForm = evaluateFormsMap[userForm];
                            evaluateCriteriaObj.evaluateForm = evaluateForm;
                            break;
                        }
                        case 'Số lần': {
                            evaluateCriteriaObj.description.value = row[key];
                            break;
                        }
                    }
                }
                evaluateCriteriaObj.form_criteria = formCriteria._id;
                const point = evaluateCriteriaObj.description.value * formCriteria.base_point;
                const max_point = formCriteria.point;
                evaluateCriteriaObj.point = max_point?((point>max_point)?max_point:point):point;
                evaluateCriteriaObj.read_only = true;
                evaluateCriterias.push(evaluateCriteriaObj);
            }
            return evaluateCriterias;
        }
        case 'input': {
            let evaluateCriterias = []
            for(row of xlData){
                let evaluateCriteriaObj = {}
                evaluateCriteriaObj.description = {}
                for(key in row){
                    switch(key){
                        case 'MSVC': {
                            const staff_id = row[key];
                            const formUser = formUsersMap[staff_id];
                            const userForm = userFormsMap[formUser];
                            const evaluateForm = evaluateFormsMap[userForm];
                            evaluateCriteriaObj.evaluateForm = evaluateForm;
                            break;
                        }
                        case 'Điểm': {
                            const point = row[key]=="x"?null:row[key];
                            if(point === null){
                                evaluateCriteriaObj.point = null;
                                break;
                            }
                            const max_point = formCriteria.point;
                            evaluateCriteriaObj.point = max_point?((point>max_point)?max_point:point):point;
                            break;
                        }
                    }
                }
                evaluateCriteriaObj.form_criteria = formCriteria._id;
                evaluateCriteriaObj.read_only = true;
                evaluateCriterias.push(evaluateCriteriaObj);
            }
            return evaluateCriterias;
        }
        case 'checkbox': {
            let evaluateCriterias = []
            for(row of xlData){
                let evaluateCriteriaObj = {}
                evaluateCriteriaObj.description = {}
                for(key in row){
                    switch(key){
                        case 'MSVC': {
                            const staff_id = row[key];
                            const formUser = formUsersMap[staff_id];
                            const userForm = userFormsMap[formUser];
                            const evaluateForm = evaluateFormsMap[userForm];
                            evaluateCriteriaObj.evaluateForm = evaluateForm;
                            break;
                        }
                        case 'Điểm': {
                            const point = row[key]=="x"?null:row[key];
                            if(point === null){
                                evaluateCriteriaObj.point = null;
                                break;
                            }
                            const max_point = formCriteria.point;
                            evaluateCriteriaObj.point = max_point?((point>max_point)?max_point:point):point;
                            break;
                        }
                    }
                }
                evaluateCriteriaObj.form_criteria = formCriteria._id;
                evaluateCriteriaObj.read_only = true;
                evaluateCriterias.push(evaluateCriteriaObj);
            }
            return evaluateCriterias;
        }
    }
}

const jsonToExcelData = (body, type) => {
    const {formUsers, criteria, formCriteria} = body;
    switch (type) {
        case 'number':{
            const data = formUsers.map(user=>{
                return {
                    "MSVC": user.user_id.staff_id,
                    "Họ và tên lót": user.user_id.lastname,
                    "Tên": user.user_id.firstname,
                    "Mã tiêu chí": criteria.code,
                    "Tên tiêu chí": criteria.name,
                    "Điểm/lần": formCriteria.base_point,
                    "Điểm tối đa": formCriteria.point?formCriteria.point:"x",
                    "Số lần": "",
                    "Điểm": ""
                }
            })
            return data;
        }
        case 'input':{
            const data = formUsers.map(user=>{
                return {
                    "MSVC": user.user_id.staff_id,
                    "Họ và tên lót": user.user_id.lastname,
                    "Tên": user.user_id.firstname,
                    "Mã tiêu chí": criteria.code,
                    "Tên tiêu chí": criteria.name,
                    "Điểm tối đa": formCriteria.point?formCriteria.point:"x",
                    "Điểm": ""
                }
            })
            return data;
        }
        case 'checkbox': {
            const data = formUsers.map(user=>{
                return {
                    "MSVC": user.user_id.staff_id,
                    "Họ và tên lót": user.user_id.lastname,
                    "Tên": user.user_id.firstname,
                    "Mã tiêu chí": criteria.code,
                    "Tên tiêu chí": criteria.name,
                    "Điểm tối đa": formCriteria.point?formCriteria.point:"x",
                    "Điểm": ""
                }
            })
            return data;
        }
    }
}


exports.a = async (req,res,next)=>{
    try {
        const id = "60db35984044ed67bf3d67d4";
        const d = await EvaluateCriteria.find({evaluateForm: id});
        const c = await EvaluateDescription.deleteMany({
            evaluateCriteria: d.map(e=>e._id)
        })

        const b = await EvaluateCriteria.deleteMany({
            evaluateForm: id
        })

        const a = await EvaluateForm.deleteOne({_id: id}
        )
        res.send({
            c,
            b,
            a
        })
    } catch (error) {
        next(error)
    }
}

exports.a2 = async (req,res,next)=>{
    try {
        const a = await EvaluateForm.updateOne({_id: "60da0b348ef0eb21c3f81338"},
            {status: 0}
        )
        res.send({
            a
        })
    } catch (error) {
        next(error)
    }
}

exports.a3 = async (req,res,next)=>{
    try {
        const a = await EvaluateForm.findOne({_id: "60da0b348ef0eb21c3f81338"})
        const b = await EvaluateCriteria.find({evaluateForm: a}).lean()
        const c = await EvaluateDescription.find({evaluateCriteria: b}).lean()
        let d = []
        
        let mapping = {}
        c.forEach(evaluateDescription => {

            mapping[evaluateDescription.evaluateCriteria.toString()]
                = !mapping[evaluateDescription.evaluateCriteria.toString()]
                ? [evaluateDescription]
                : [...mapping[evaluateDescription.evaluateCriteria.toString()], evaluateDescription]
        })

        res.send({
            mapping
        })
    } catch (error) {
        next(error)
    }
}


exports.a4 = async (req,res,next)=>{
    try {
        const id = "60db4bb67e437101f474e3e2";
        // const b = await EvaluateCriteria.deleteOne({
        //     _id: id
        // })
        const c = await EvaluateCriteria.updateOne({
            _id: "60db3598e506d82438a7d3b2"
        }, {read_only: true})
        res.send({
            // b,
            c
        })
    } catch (error) {
        next(error)
    }
}