const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');
const ADMIN = require('../config/admin.config');

require('dotenv').config();

//database object
const db = {};

db.mongoose = mongoose;
db.user = require("./user.model");
db.department = require("./department.model");
//danh muc tieu chuan, tieu chi
db.criteria = require("./criteria.model");
db.standard = require("./standard.model");
//dot danh gia, form, loai form
db.evaluationReview = require("./evaluationReview.model");
db.form = require("./form.model");
db.formType = require("./formType.model");
//don vi, nguoi tham gia
db.formDepartment = require("./formDepartment");
db.formUser = require("./formUser.model");
//danh gia, tieu chuan, tieu chi Form
db.formEvaluation = require("./formEvaluation.model");
db.formStandard = require("./formStandard.model");
db.formCriteria = require("./formCriteria.model");
db.criteriaOption = require("./criteriaOption.model");

const User = db.user;

//connect database
console.log(process.env.MONGODB_URI);
db.mongoose
    .connect(process.env.MONGODB_URI // mongoAtlas
        || `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}` //mongoDB
    ,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{
        console.log("Connect successfully to MongoDB");
        initDatabase();
    })
    .catch(err=>{
        console.log(`URI: ${process.env.MONGODB_URI}`);
        console.error("Connection error: ", err);
        next(err);
        process.exit();
    })


//database initialization
initDatabase = async ()=>{
    //create root admin
    User.estimatedDocumentCount(async (err,count)=>{
        if(err){
            process.exit();
        }
        if (!err && count === 0) {
            try {
                const {staff_id,email,firstname,lastname,fullname,phone,password,roles} = ADMIN;
                const user = new User({
                    staff_id,
                    email,
                    firstname,
                    lastname,
                    fullname,
                    phone,
                    roles,
                    password
                });
                await user.save();
                console.log("Add root admin to database");
            } catch (error) {
                console.error(error);
                process.exit();
            }
        }
    })
}

module.exports = db;