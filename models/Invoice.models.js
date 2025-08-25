const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
    {
        roomId : {type: mongoose.Schema.Types.ObjectId, ref: 'Room', require: true }, 
        tenantId : {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', require: true},
        startDate : { type: Date, require: true},
        endDate : { type: Date, require: true},
        roomPrice : { type: Number, require: true }, 
        services : [
            {
                name : String, 
                price : Number, 
                quantity : Number
            }
        ], 
        totalAmount : { type : Number, require : true }, 
        status : { type : String , enum :['Unpaid','Paid'], default: 'Unpaid' }
    }, 
    { timestamps: true}
);

module.exports = mongoose.model('Invoice', invoiceSchema);