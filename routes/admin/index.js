//router
const CriteriaRouter = require("./criteria.route");
const StandardRouter = require("./standard.route");
const DepartmentRouter = require("./department.route");
const UserFormRouter = require("./userForm.route")
const ReviewRouter = require("./review.route");
const UserRouter = require("./user.route");
const FileRouter = require("./file.route");
const FormDepartmentRouter = require("./formDepartment.route");

//router
module.exports = function(app){
    UserRouter(app);
    DepartmentRouter(app);
    StandardRouter(app);
    CriteriaRouter(app);
    UserFormRouter(app);
    ReviewRouter(app);
    FileRouter(app);
    FormDepartmentRouter(app);
}


// module.exports = {
//     CriteriaRouter,
//     StandardRouter,
//     DepartmentRouter,
//     UserFormRouter,
//     ReviewRouter,
//     UserRouter,
//     FileRouter,
//     FormDepartmentRouter
// }