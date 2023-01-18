var setcontacts = async  function(req, res) {
  console.log('setcontacts');
  var _id=req.body._id||'';
  var contacts=req.body.contacts||[];
  var output={};
  output.post=[];
  console.log('_id'+_id);
  var database = req.app.get('database');
	if (database.db) {
    if(_id==''){
      console.log('_id==""')
      output.status=401;
      res.send(output);
      return;
    }
    var find_contacts=await database.ContactsModel.find({_id});
    if(find_contacts.errors||find_contacts.length===0){
      console.log('ContactsModel.find err');
      output.status=401;
      res.send(output);
      return;
    }
    var contacts_original=find_contacts[0]._doc.contacts.map(x=>x);
    contacts.map(em=>{
      if(contacts_original.indexOf(em)==-1){
        contacts_original.push(em);
      }
    });
    database.ContactsModel.update({_id},{contacts:contacts_original},async (err)=>{
      if(err){
        console.log('setcontacts: ContactsModel.update err');
        output.status=402;
        res.send(output);
        return;
      }
      var find_friends= await database.UserModel.find({ph:{$in:contacts_original},_id:{$ne:_id}});
      var friends=await find_friends.map(em=>em._doc.user_id);

      var find_follow= await database.FollowModel.find({_id});
      if(find_follow.errors||find_follow.length===0){
        console.log('setcontacts: FollowModel.find err');
        output.status=403;
        res.send(output);
        return;
      }
      var unfollow = await find_follow[0]._doc.unfollow.map(x=>x);

      var follow = await find_follow[0]._doc.follow.map(x=>x);
      
      follow = follow.concat(friends);
      var follow_unique=follow.reduce((unique, item) =>
      unique.includes(item) ? unique : [...unique, item], []);
      
      var follow_result=[];
      follow_unique.map(em=>{
        if(unfollow.indexOf(em)==-1){
          follow_result.push(em);
        }
      });
      console.log(follow_unique);
      console.log(follow_result);
      var find_result_follow= await database.UserModel.find({user_id:{$in:follow_result}});
      if(find_result_follow.errors){
        console.log('setcontact error');
        output.status=405;
        res.send(output);
        return;
      }
      output.follow=await find_result_follow.map(em=>{
        return{
          id:em._doc.id,
          user_id:em._doc.user_id,
          img:em._doc.img,
          uid:em._doc.uid
        }
      });
      database.FollowModel.update({_id},{follow:follow_result},(err)=>{
        if(err){
          console.log('setcontacts: FollowModel.update err');
          output.status=404;
          res.send(output);
          return;
        }
        output.status=100;
        res.send(output);
      });
    });
	} else {
    output.status = 410;
    res.send(output);
	}
};
module.exports.setcontacts = setcontacts;