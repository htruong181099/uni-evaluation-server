const db = require("../model");
const Form = require("../model/form.model");
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const User = db.user;

exports.addFormUser = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");
        const formdepartments = FormDepartment.find({
            form_id: form._id,
        })
        .populate("department_id")
        .select("_id department_id");
        for(i in formdepartments){
            if(formdepartments[i].department_id.parent == null){
                const users = User.find({
                    department: formdepartments[i]._id
                })
                return res.status(200).json({
                    users
                })
            }
        }
    } catch (error) {
        next(error);
    }
}
