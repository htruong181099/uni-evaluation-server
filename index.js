const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

//middleware

//logger
const morgan = require('morgan');
app.use(morgan('dev'));

//Router
const Router = require('./routes');
Router(app);

//Error handler
app.use((err,req,res,next)=>{
    res.send(err);
})

//404 handler
app.use((req,res,next)=>{
    res.json({
        error: 404,
        message: "404 error. File not Found!"
    })
})


app.listen(PORT,()=>{
    console.log(`App is running on PORT ${PORT}`);
})