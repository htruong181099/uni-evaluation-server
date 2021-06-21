const mongoose = require('mongoose');
const TYPE = ['radio', 'checkbox', 'input', 'number','detail'];

//schema
const CriteriaSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    standard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Standard",
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: TYPE    
    },
    description: {
        type: String
    },
    create_date:{
        type: Date,
        default: Date.now()
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

//virtual field
CriteriaSchema.statics.getCriteriaTypes = ()=>{
    // ['radio', 'checkbox', 'input', 'number','detail']
    return TYPE;
}

const Criteria = mongoose.model(
    "Criteria",
    CriteriaSchema
)

module.exports = {
    Criteria,
    TYPE
}