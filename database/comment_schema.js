var Schema = {};

Schema.createSchema = function(mongoose){
    var PostSchema = mongoose.Schema({
        comment:[],
        player:[]
    });
    return PostSchema;
};

module.exports = Schema;