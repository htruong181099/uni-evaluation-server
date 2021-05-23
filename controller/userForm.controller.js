const db = require("../model");
const FormUser = db.formUser;
const Evaluation = db.evaluation;
const UserForm = db.userForm;

exports.getUserForm = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const user_id = req.userId;
        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id");

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formUser = await FormUser.findOne({
            user_id,
            form_id: form._id
        }).select("_id")
        if(!formUser){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        const userForm = await UserForm.findOne({
            form_user: formUser._id,
            form_id: form._id
        });
        if(!userForm){
            userForm = new UserForm({
                form_user: formUser._id,
                form_id: form._id
            })

            userForm.save((err,doc)=>{
                req.userForm = doc;
                return next();
            })
        }
        // return res.status(200).json({
        //     statusCode: 200,
        //     message: "Success",
        //     userForm: userForm._id
        // })
        req.form_id = form._id;
        req.userForm = userForm._id;
        return next();

    } catch (error) {
        next(error);
    }
}