var io = require('socket.io').listen(8089,{origins: '*:*'});

io.sockets.on('connection', function(socket){
    var userList = [];

    socket.on('newUser', function(data){
        
        socket.username = data.user;
        
        socket.to(socket.room).broadcast.emit('message', {
            user: "Node",
            timestamp: new Date(),
            message: data.user + " has joined the room",
            messageType: 'system'
        });
        getUserList();      
    });

    socket.on('newRoom', function(room){
        socket.leave(socket.room);
        socket.room = room;
        socket.join(room);
    });


    socket.on('message', function(data){
        var message = {
            user: data.user,
            timestamp: new Date(),
            message: data.message,
            messageType: 'user'
        };
        socket.in(socket.room).emit('message', message) 
        socket.in(socket.room).broadcast.emit('message', message);
    });

    socket.on('leaving', function(data){
        socket.leave(socket.room)
        getUserList();  
        socket.to(socket.room).broadcast.emit('message', {
            user: "Node",
            timestamp: new Date(),
            message: data.user + " has left the room",
            messageType: 'system'
        });
    });

    var getUserList = function(){
        userList = [];
        for (var i=0; i < io.sockets.clients(socket.room).length; i++){
            console.log(io.sockets.clients(socket.room)[i].username);
            userList.push(io.sockets.clients(socket.room)[i].username);
        }
    
        socket.in(socket.room).emit('userList', {
            users: userList
        });
        socket.to(socket.room).broadcast.emit('userList', {
            users: userList
        });
    }

});
