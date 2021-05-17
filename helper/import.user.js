const xlsx = require('xlsx');
const filePath = process.argv.slice(2)[0];
const workbook = xlsx.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]]

const mongoose = require('mongoose');
// const MONGODB_URI = "mongodb+srv://hoangtruong181099:Mob9oFd7F3VHSqRr@uni-evaluation-db.cvlm7.mongodb.net/uni-evaluation-DB?retryWrites=true&w=majority";
//v2
const MONGODB_URI = "mongodb+srv://hoangtruong181099:Mob9oFd7F3VHSqRr@uni-evaluation-db.cvlm7.mongodb.net/uniEvalDB?retryWrites=true&w=majority"
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
    })
    .catch(err=>{
        console.log(`URI: ${process.env.MONGODB_URI}`);
        console.error("Connection error: ", err);
        next(err);
        process.exit();
    })

readExcel = () =>{
    const users = [];
    let user = {};

    for (let cell in worksheet){
        const cellAsString = cell.toString();
        if(cellAsString[1] !== 'r'
            && cellAsString !== 'm' && (cellAsString[1] > 1 || (cellAsString[1] == 1 && cellAsString[2]))

        ){
            if(cellAsString[0] === 'A'){
                user.staff_id = worksheet[cell].v;
            }
            let temp;
            if(cellAsString[0] === 'B'){
                user.lastname = worksheet[cell].v;
            }
            if(cellAsString[0] === 'C'){
                user.firstname = worksheet[cell].v;
            }
            if(cellAsString[0] === 'D'){
                user.birthday = worksheet[cell].v;
            }
            if(cellAsString[0] === 'E'){
                user.gender = worksheet[cell].v;
            }
            if(cellAsString[0] === 'F'){
                user.email = worksheet[cell].v;
            }
            if(cellAsString[0] === 'G'){
                user.password = worksheet[cell].v;
            }
            if(cellAsString[0] === 'H'){
                user.roles = worksheet[cell].v;
            }
            if(cellAsString[0] === 'I'){
                user.phone = worksheet[cell].v;
            }
            if(cellAsString[0] === 'J'){
                const department = worksheet[cell].v;
                user.department = department.split(",");
            }
            if(cellAsString[0] === 'K'){
                if(worksheet[cell].v == 0){
                    user.manage = [];
                }
                else{
                    const manage = worksheet[cell].v;
                    user.manage = manage.split(",");
                }
                users.push(user);
                user = {}
            }
        }
    }
    return users;
}

addToDB = async (users)=>{
    try{
        const User = require("../model/user.model");
        const Department = require("../model/department.model");
        for (let i in users){
            let usr = users[i];
            departmentlist = [];
            if (usr.department.length != 0) {
                for(i in usr.department){
                    const id = await Department.findOne({
                        department_code: usr.department[i]
                    }).select("_id");
                    departmentlist.push(id._id);
                }
            }
            birthday = usr.birthday.split("/");
            // console.log(new Date(usr.birthday))
            const user = new User({
                staff_id: usr.staff_id,
                lastname: usr.lastname,
                firstname: usr.firstname,
                birthday: new Date(birthday[2],birthday[1],birthday[0]),
                gender: usr.birthday=="Nam"?"Male":"Female",
                email: usr.email,
                password: usr.password,
                roles: usr.roles,
                phone: usr.phone,
                department: departmentlist
            });
            user.save(async (error,saved)=>{
                if(error && error.code === 11000){
                }
                else{
                    if(usr.manage){
                        for(i in usr.manage){
                            const department = await Department.findOne({department_code: usr.manage[i]});
                            console.log(saved);
                            department.manager = saved._id;
                            await department.save();
                        }
                    }
                }
            });
            
        }
        console.log("Add to user");
    }
    catch(err){
        console.error(err);
    }
    process.exit();
}

addToDB(readExcel());
