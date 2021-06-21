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
    let types = [];
    for(type of TYPE){
        switch(type){
            case 'radio': {
                types.push({
                    type,
                    description: "Chọn 1"
                })
                break;
            }
            case 'checkbox': {
                types.push({
                    type,
                    description: "Tích chọn"
                })
                break;
            }
            case 'input': {
                types.push({
                    type,
                    description: "Input số điểm"
                })
                break;
            }
            case 'number': {
                types.push({
                    type,
                    description: "Input số lần"
                })
                break;
            }
            case 'detail': {
                types.push({
                    type,
                    description: "Input chi tiết, % đóng góp"
                })
                break;
            }
        }
        
    }
    
}

const Criteria = mongoose.model(
    "Criteria",
    CriteriaSchema
)

module.exports = Criteria;