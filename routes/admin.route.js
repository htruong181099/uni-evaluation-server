const adminController = require('../controller/admin.controller');
const departmentController = require("../controller/department.controller")
const jwtMiddleware = require('../middleware/jwt.middleware');

module.exports = function(app){

    app.use("/admin",
        jwtMiddleware.verifyToken,
        jwtMiddleware.isAdmin
    )

    app.get("/admin",(req,res,next)=>{
        res.json({
            message: "Admin page"
        });
    })

    app.get("/admin/user",
        adminController.getUsers
    )

    app.get("/admin/user/:id",
        adminController.getUser
    )

    app.get("/admin/department",
        departmentController.getDepartments
    )

    app.get("/admin/department/:id",
        departmentController.getDepartment
    )
}