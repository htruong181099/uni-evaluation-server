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