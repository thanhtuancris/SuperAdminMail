const mongoose = require('mongoose');

async function connect(){
    try{
        await mongoose.connect('mongodb://admin:admin123456@127.0.0.1:27017/database?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('connected to mongo');
    }catch(e){
        console.log('failed to connect');
    }
}
module.exports = {connect}
