const AuthRouter = require("./auth.route");
const AdminRouter = require("./admin.route");
const FormRouter = require("./form.route")
const UserRouter = require("./user.route")

module.exports = (app)=>{
    app.use((req,res,next)=>{
        res.header(
            "Access-Control-Allow-Headers",
            "Authorization, Origin, Content-Type, Accept"
        );
        next();
    })

    app.get("/",(req,res,next)=>{
        res.json({
            message: "Server is still working!"
        })
    })

    AuthRouter(app);
    AdminRouter(app);
    FormRouter(app);
    UserRouter(app);
}