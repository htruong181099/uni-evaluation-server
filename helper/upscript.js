const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://hoangtruong181099:Mob9oFd7F3VHSqRr@uni-evaluation-db.cvlm7.mongodb.net/uni-evaluation-DB?retryWrites=true&w=majority";

const Department = require("../model/department.model");
const User = require("../model/user.model")

mongoose
    .connect(MONGODB_URI // mongoAtlas
        || `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}` //mongoDB
    ,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{
        console.log("Connect successfully to MongoDB");
    })
    .catch(err=>{
        console.log(`URI: ${process.env.MONGODB_URI}`);
        console.error("Connection error: ", err);
        next(err);
        process.exit();
    })

const func = async () =>{
    const DVQL = await Department.findOne({
        department_code: "DVQL"
    }).select("_id")
    const dep = await Department.find({
        manager: {$ne: null}
    }).select("manager")
    const departmentManager = dep.map(e=>e.manager);
    const users = await User.find({
        "_id": departmentManager, 
        "department": {$not: DVQL._id}
    });
    console.log(users);
    process.exit()
}

func()