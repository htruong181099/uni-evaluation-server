const db = require("../model/");
const User = db.user;

exports.getUser = async (req,res,next)=>{
    const {id} = req.params;
    try{
        const user = await User.findById(id).select("-__v -password");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            user: user
        })
    }
    catch(error){
        next(error);
    }
}

exports.getUsers = async (req,res,next)=>{
    try{
        const users = await User.find()
                    .sort({"staff_code": 1})
                    .populate("department")
                    .select("-__v -password");

        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            users: users
        })
    }
    catch(error){
        next(error);
    }
}

