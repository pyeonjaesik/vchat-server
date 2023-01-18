var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var GroupSchema = mongoose.Schema({
		id: {type: String, required: true, 'default':''},
		id_query: {type: String, 'default':'', index: 'text'},
		member:{type:Number,'default':0},
	});
	return GroupSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

