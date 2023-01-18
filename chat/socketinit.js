var socketinit = async function(server,database,app){
  var database = database;
  var io = require('socket.io')(server);
  await io.on('connection', async function (socket) {
    await app.set('socket', socket);
    await app.set('io', io)
    socket.on('login', function (data) {
      console.log('socket login:'+data._id)
      database.UserModel.update({_id:data._id},{socket:socket.id},(err)=>{
        if(err){
          console.log('socket login err');
          return;
        }
        database.TkModel.update({_id:data._id},{socket:socket.id},(err)=>{
          if(err){
            console.log('socekt login err2');
            return;
          }
        });
        console.log('login success');
      });
    });

  });
}

 module.exports = socketinit;