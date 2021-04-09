const AuthRouter = require("./auth.route");
const AdminRouter = require("./admin.route");

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
            message: "Hello, world!"
        })
    })

    AuthRouter(app);
    AdminRouter(app);
}