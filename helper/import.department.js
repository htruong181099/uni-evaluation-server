const xlsx = require('xlsx');
const filePath = process.argv.slice(2)[0];
const workbook = xlsx.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]]

const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://hoangtruong181099:Mob9oFd7F3VHSqRr@uni-evaluation-db.cvlm7.mongodb.net/uni-evaluation-DB?retryWrites=true&w=majority";
// const MONGODB_URI = "";
const dbConfig = require("../config/db.config");

mongoose
    .connect(MONGODB_URI // mongoAtlas
        || `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}` //mongoDB
    ,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{
        console.log("Connect successfully to MongoDB");
        //initDatabase();
    })
    .catch(err=>{
        console.log(`URI: ${process.env.MONGODB_URI}`);
        console.error("Connection error: ", err);
        next(err);
        process.exit();
    })

readExcel = () =>{
    const departments = [];
    let department = {};

    for (let cell in worksheet){
        const cellAsString = cell.toString();
        // console.log(cellAsString);
        if(cellAsString[1] !== 'r'
            && cellAsString !== 'm' && (cellAsString[1] > 1 || (cellAsString[1] == 1 && cellAsString[2]))

        ){
            if(cellAsString[0] === 'A'){

                department.department_code = worksheet[cell].v;
            }
            if(cellAsString[0] === 'B'){
                department.name = worksheet[cell].v;
            }
            if(cellAsString[0] === 'C'){
                if(worksheet[cell].v != "0"){
                    department.parent =  worksheet[cell].v;
                }
                else{
                    department.parent = "";
                }
                departments.push(department);
                department = {}
            }
        }
    }
    return departments;
}

addToDB = async (departments)=>{
    try{
        const Department = require("../model/department.model");
        for (let i in departments){
            let dep = departments[i];
            let parent;
            if(dep.parent != ""){
                const id = await Department.findOne({
                    department_code: dep.parent
                }).select("_id");
                parent = id._id;
            }
            const department = new Department({
                department_code : dep.department_code,
                name : dep.name,
            });
            if(parent){
                department.parent = parent;
            }
            await department.save((error)=>{
               if(error && error.code === 11000){
               }
            });
        }
        console.log("Add to department");
    }
    catch(err){
        console.error(err);
    }
    process.exit();
}

addToDB(readExcel());