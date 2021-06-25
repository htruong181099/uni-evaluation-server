

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

//constant
const ROOTDIR = path.dirname(require.main.filename);

//validator
const {body, param, query} = require("express-validator");

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
            user.password = "password";
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

exports.importDepartment = async (req,res,next)=>{
    try {
        const departments = req.departments;
        const departmentsCount = users.length;
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

exports.deleteFile = async (req,res,next)=>{
    try {
        fs.unlinkSync(req.file.path)
        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    } catch (error) {
        next(error);
    }
}

exports.createFile = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        // const {dcode, scode, ccode} = req.query;
        const {dcode, scode, ccode} = req.body;
        console.log(req.query);

        const [form, department, standard, criteria] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id"),
            Standard.findOne({code: scode}).select("_id"),
            Criteria.findOne({code: ccode}).select("_id code name")
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

        const data = formUsers.map(u => {
            return {
                "MSVC": u.user_id.staff_id,
                "Mã tiêu chí": criteria.code,
                "Tên tiêu chí": criteria.name,
                "Điểm/lần": formCriteria.base_point,
                "Điểm tối đa": formCriteria.point?formCriteria.point:"",
                "Số lần": "",
                "Điểm": ""
            }
        })

        let wb = xlsx.utils.book_new();
        const dataSheet = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb, dataSheet)
        // xlsx.utils.sheet_add_json(wb, data, {
        //     header: ["MSVC", "Mã tiêu chí","Tên tiêu chí","Điểm/lần",
        //     "Điểm tối đa","Số lần","Điểm"]
        // });
        console.log(wb);
        xlsx.writeFile(wb, `./public/files/${dcode}-${ccode}.xlsx`);
        const filePath = `${path.dirname(require.main.filename)}\\public\\files\\${dcode}-${ccode}.xlsx`;
        
        //res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.download(filePath, (err)=>{
            console.log(err);
            
        })
        
        req.filePath = filePath;
        // next();
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


exports.downloadFile = async (req,res,next)=>{
    try {
        const filePath = `${path.dirname(require.main.filename)}\\public\\files\\User.xlsx`;
        console.log(filePath);
        res.download(filePath);
        res.status(200).json({
            message: "ok"
        });
        fs.unlinkSync(req.file.path)
    } catch (error) {
        next(error)
    }
}

exports.getFile = (req, res, next)=>{
    try {
        const {file} = req.query;
        let filePath;
        switch(file){
            case 'user': {
                filePath = `${ROOTDIR}\\public\\files\\import\\User_template.xlsx`;
                req.filePath = filePath;
                break;
            }
            case 'department': {
                filePath = `${ROOTDIR}\\public\\files\\import\\Department_template.xlsx`;
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
        // res.download(filePath);
        res.send(filePath)
    } catch (error) {
        next(error)
    }
    
}