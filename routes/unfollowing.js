var unfollowing = function(req,res){
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    database.FollowModel.find({_id},(err,results)=>{
      if(err){
        console.log('FollowModel.find');
        output.status=400;
        res.send(output);
        return;
      }
      if(results.length>0){
        var follow_temp=results[0]._doc.follow;
        var unFollow_temp=results[0]._doc.unfollow||[];
        console.log('unFollow_temp');
        console.log(unFollow_temp);

        unFollow_temp.unshift(user_id);

        var unfollow_unique=unFollow_temp.reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

        var f_i=follow_temp.indexOf(user_id);
        if(f_i==-1){
          console.log('aleady unFollow');
          output.status=102;
          res.send(output);
          return;
        }
        follow_temp.splice(f_i,1);
        database.FollowModel.update({_id},{follow:follow_temp,unfollow:unfollow_unique},(err)=>{
          if(err){
            console.log('FollowModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          database.UserModel.find({user_id},(err,results)=>{
            if(err){
              console.log('UserModel.find err');
              output.status=402;
              res.send(output);
              return;
            }
            if(results.length>0){
              var your_id=results[0]._doc._id;
              database.FollowModel.update({_id:your_id},{$inc:{follower:-1}},(err)=>{
                if(err){
                  console.log('FollowModel.update err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                console.log('unfollowing success');
                output.status=100;
                res.send(output);
                return
              });
            }else{
              console.log('UserModel.find results.length==0 -->');
              output.status=403;
              res.send(output);
            }
          });
        });
      }else{
        console.log('FollowModel.find resulst.length==0 -->err');
        output.status=401;
        res.send(output);
      }
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.unfollowing = unfollowing;