var getalarm = async function(req, res) {
  console.log('getalarm')
  var _id=req.body._id||'';
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('getalarm find_user error');
      output.status=400;
      res.send(output);
      return;
    }
    var user_id=find_user[0]._doc.user_id;

    var find_follow=await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length==0){
      console.log('getalarm find_follow error');
      output.status=401;
      req.send(output);
      return;
    }
    var group=find_follow[0]._doc.group.map(x=>x);
    
    var find_video=await database.VideoModel.find({$or:[{
      $and:[{groupList:{$in:group}},{show:100}]
    },{
      $and:[{personList:{$in:[user_id]}},{show:100}]
    }]}).sort({ct:-1}).limit(500);
    if(find_video.errors){
      console.log('getalarm_find_video error');
      output.status=402;
      res.send(output);
      return;
    }
    var user_id_arr=[];
    var videolist_for_find=[];
    var videolist=await find_video.map(em=>{
      user_id_arr.push(em._doc.user_id);
      user_id_arr=user_id_arr.concat(em._doc.personList);
      videolist_for_find.push(em._doc._id.toString());
      return{
        post_id:em._doc._id.toString(),
        user_id:em._doc.user_id,
        read:em._doc.read.indexOf(user_id)==-1?false:true,
        comment:0,
        love_user:[],
        personList:em._doc.personList,
        groupList:em._doc.groupList,
        ct:em._doc.ct
      }
    });

    var find_comment=await database.CommentModel.find({_id:{$in:videolist_for_find}});
    if(find_comment.errors){
      console.log('getalarm error');
      output.status=403;
      res.send(output);
      return;
    }
    find_comment.map(emP=>{
      var u_i=emP._doc.player.findIndex(emS=>emS.user_id==user_id);
      if(u_i==-1){
        var v_i=videolist.findIndex(emZ=>emZ.post_id==emP._doc._id.toString());
        let videolist_comp=videolist[v_i];
        videolist.splice(v_i,1,{
          ...videolist_comp,
          comment:emP._doc.comment.length
        })
      }else{
        if(emP._doc.player[u_i].read<emP._doc.comment.length){
          var v_i=videolist.findIndex(emZ=>emZ.post_id==emP._doc._id.toString());
          let videolist_comp=videolist[v_i];
          videolist.splice(v_i,1,{
            ...videolist_comp,
            comment:(emP._doc.comment.length-emP._doc.player[u_i].read)
          })
        }
      }
    });
    var find_alarm= await database.AlarmModel.find({_id});
    if(find_alarm.errors||find_alarm.length==0){
      console.log('getalarm AlarmModel.find error');
      output.status=404;
      res.send(output);
      return;
    }
    find_alarm[0]._doc.alarm.map(emP=>{
      if(emP.type=='love'&&emP.user_arr.length>0){
        var v_i=videolist.findIndex(emS=>emS.post_id==emP.post_id);
        user_id_arr=user_id_arr.concat(emP.user_arr);
        if(v_i!=-1){
          let videolist_comp=videolist[v_i];
          videolist.splice(v_i,1,{
            ...videolist_comp,
            love_user:emP.user_arr
          })
        }
      }
    });
    user_id_arr=user_id_arr.filter((item, index) => user_id_arr.indexOf(item) === index);
    var find_user_arr= await database.UserModel.find({user_id:{$in:user_id_arr}});
    if(find_user_arr.errors){
      console.log('getalarm: user_arr find error');
      output.status=405;
      res.send(output);
      return;
    }
    output.user_arr= await find_user_arr.map(em=>{
      return{
        user_id:em._doc.user_id,
        id:em._doc.id,
        img:em._doc.img
      }
    });
    output.alarm=[];
    videolist.map(em=>{
      if(em.read==false||(em.comment+em.love_user.length)>0){
        output.alarm.push(em);
      }
    });
    database.AlarmModel.update({_id},{alarm:[]},(err)=>{
      if(err){
        console.log('getalarm AlarmModel.update error');
        output.status=406;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
    })
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getalarm = getalarm;