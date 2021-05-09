const db = require("../model");
const Form = require("../model/form.model");
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const User = db.user;

exports.addFormUser = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");
        const formdepartments = await FormDepartment.find({
            form_id: form._id,
        })
        .populate("department_id")
        .select("_id department_id");
        for(i in formdepartments){
            console.log(formdepartments[i]);
            if(!formdepartments[i].department_id.parent && formdepartments[i].department_id.parent == null){
                const users = await User.find({
                    department: formdepartments[i].department_id._id
                })
                for(let x in users){
                    if(!await FormUser.findOne({
                        form_id: form._id,
                        user_id: users[x]._id
                    })){
                        console.log(users[x]);
                        const formUser = new FormUser({
                            user_id: users[x]._id,
                            department_form_id: formdepartments[i]._id,
                            form_id: form._id
                        })
                        await formUser.save()
                    }
                }
            }
        }
        return res.status(200).json({
            statusCode: 200,
            message: 'Add form department and users successfully'
        })
    } catch (error) {
        next(error);
    }
}

// exports.getFormUser = async (req,res,next)=>{
//     try {
//         const {f} = req.params;
//     } catch (error) {
//         next(error);
//     }
// } 