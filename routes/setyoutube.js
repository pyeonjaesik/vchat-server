var setyoutube = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var youtube = req.body.sns||{url:'',follow:0};
  var database = req.app.get('database');
  console.log('set youtube');
  console.log(youtube)
	if (database.db) {
    database.UserModel.update({_id},{youtube},(err)=>{
      if(err){
        console.log('set youtube error');
        output.status=401;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
      return;
    });
	} else {
    output.status =410;
    res.send(output);
	}
	
};
module.exports.setyoutube = setyoutube;