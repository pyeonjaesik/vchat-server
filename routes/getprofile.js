var getprofile = function(req, res) {
  console.log('get profile');
  var user_id=req.body.user_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({user_id},(err,results)=>{
      if(err){
        console.log('getmainpost err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var _id=results[0]._doc._id;
        output.profile={
          uid:results[0]._doc.uid,
          video:results[0]._doc.video,
          intro:results[0]._doc.intro,
          sns:{
            instagram:results[0]._doc.instagram,
            youtube:results[0]._doc.youtube,
            tiktok:results[0]._doc.tiktok,
            vanhana:results[0]._doc.vanhana,
          },
          price:results[0]._doc.price
        }
        console.log('getprofile success');
        //
        //
        database.FollowModel.find({_id},(err,results)=>{
          if(err){
            console.log('FollowModel.find err');
            output.status=407;
            res.send(output);
            return;
          }
          if(results.length>0){
            output.follower=results[0]._doc.follower;
            output.follow=results[0]._doc.follow.map(x=>x);
            output.group=results[0]._doc.group.map(x=>x);
            output.status=100;
            res.send(output);
            return;
          }else{
            console.log('FollowModel.find results.length==0 -->err');
            output.status=408;
            res.send(output);
          }
        });
      }else{
        console.log('getprofile results.length==0 --> err');
        output.status=401;
        res.send(output);
        return;
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getprofile = getprofile;