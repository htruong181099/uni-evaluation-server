module.exports = (app)=>{
    app.get("/",(req,res,next)=>{
        res.json({
            message: "Hello, world!"
        })
    })
}