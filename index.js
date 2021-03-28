const express = require('express');
const app = express();

//constant
const PORT = process.env.PORT || 5000;
const CLIENTPORT = 3000;

//database
const db = require("./model");


//middleware
const cors = require('cors'); //cross origin
const corsOptions = {
    origin: `http://localhost:${CLIENTPORT}`
};

app.use(cors(corsOptions));
app.use(express.json());

//logger
const morgan = require('morgan');
app.use(morgan('dev'));

//Router
const Router = require('./routes');
Router(app);

//Error handler
app.use((err,req,res,next)=>{
    const error = err;
    error.statusCode = err.statusCode || 500;

    //Log Error Stack
    console.error(error.stack);
    res.status(error.statusCode).send({
        statusCode: error.statusCode,
        message: error.message
    })
})

//404 handler
app.use((req,res,next)=>{
    res.json({
        statusCode: 404,
        message: "404 error. File not Found!"
    })
})

app.listen(PORT,()=>{
    console.log(`App is running on PORT ${PORT}`);
})