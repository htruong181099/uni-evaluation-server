const db = require("../model/");
const FormUser = db.formUser;
const FormDepartment = db.formDepartment;
const UserForm = db.userForm;

exports.checkFormAccess = async (req,res,next) => {
    try {
        const {ufid} = req.params;
        const level = parseInt(req.query.level);
        const user_id = req.userId;
        
        const userform = await UserForm.findById(ufid).populate("form_user");

        console.log(level);
        
        //check if user is the one in userform
        if (level === 1){
            const formUser = await FormUser.findOne({
                _id: userform.form_user._id,
                user_id
            })
            if(formUser){
                next();
                return;
            }
        }
        // check if head
        if (level === 2){
            const formDepartment= await FormDepartment.findOne({
                _id: userform.form_user.department_form_id,
            })
            if(formDepartment.head.toString() === user_id){
                next();
                return;
            }
        }
        // check if in council
        if (level === 3){
            const formCouncil = await FormDepartment.findOne({
                form_id: userform.form_id,
                level: 3
            })
            const council = await FormUser.findOne({
                department_form_id: formCouncil._id,
                user_id,
                isDeleted: false
            })
    
            if(council){
                next();
                return;
            }
        }

        return res.status(403).json({
            statusCode: 403,
            message: "Require permission"
        })

    } catch (error) {
        next(error);
    }
}