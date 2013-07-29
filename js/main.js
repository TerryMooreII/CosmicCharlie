
(function(){
    var handle = localStorage.getItem('CosmicCharlie-handle');
    var socket = null;
    var room = 'main';
    var socketServer = window.location.origin;

    $('#newRoom').val(window.location.hash.substring(1));


    $('#newRoomBtn').on('click', function(e){
        e.preventDefault;
        var data = {
            user: handle
        };
        socket.emit('leaving', data);
        socket.disconnect();    
        establishConnection();
       
    })

    var establishConnection = function(){
        socket = null;
        options = [];
        options['force new connection'] = true;
        
        socket = io.connect(socketServer, options);
        
        room = $('#newRoom').val() !== '' ? $('#newRoom').val() : 'main' ;
        window.location.hash = room;
        
        socket.emit('newRoom', room);

        var data = {
            user: handle
        };
        
        socket.emit('newUser', data); 

        loadChatEvents();
        $('#messages').empty();
    }

    

    var loadChatEvents = function(){
            
        // Log messages from the server
        socket.on('message', function (data) {
            var message = [];
            
            if (data.messageType === 'system'){
                message = [
                    '<li class="system-message alert alert-info text-center">',
                        '<span>' + data.message + '</span>',
                    '</li>'
                ];
            }else{
                pos = 'left';
                if (data.user === handle){
                    pos = 'right';
                }
                message = [
                    '<li style="padding:5px">',
                        '<strong style="display:block;float:' + pos + '; margin-top:8px">',
                            data.user,
                        '</strong>', 
                        '<span class="bubble-' + pos + '">' + sanitze(data.message) + '</span>',
                        '<div class="clearfix"></div>',
                    '</li>'
                ];
            }
            $('#messages').append(message.join(""))
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        });
        
        socket.on('userList', function (data) {
            $('#whos-online').empty();
            $.each(data.users, function(k, handle){
                var html = [
                    '<li>',
                        '<i class="icon-user"></i>',
                        '<span style="padding:5px">'+handle+'</span><i class="icon-magnet"></i>',
                    '</li>'
                ]
                $('#whos-online').append(html.join(""))    
            });
            
        });

        $('#message').on('keyup', function(e){
            if (e.keyCode === 13)
                $('#send').trigger('click');
        });

        $('#send').on('click', function(e){
            e.preventDefault();
            var text = $('#message').val();

            if (text === '')
                return false;

            var data = {
                user: handle,
                message: text
            };

            socket.emit('message', data);
            $('#message').val('');
        });

        var sanitze = function(message){
            return message.replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/\n/g, '<br>')
                          .replace(/\n\r/g, '<br>')
                          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                          .replace(/ /g, '&nbsp')
        }

        window.onbeforeunload = function(e){
            var data = {
                user: handle
            };
            socket.emit('leaving', data);
        }
    }
    var init = function(){
    	if (!handle){
		    $('.modal').modal();
		    $('.modal a').on('click', function(){
		        var h = $('#handle').val();
		        if ( h != ''){
		            handle = h;
		            $('.modal').modal('hide'); 
		            localStorage.setItem('CosmicCharlie-handle', handle);
                    $('#my-handle').text(handle);
		            establishConnection();   
		        }
		    });
		}else{
			establishConnection(); 
            $('#my-handle').text(handle);
		}	
            }

    
    $('#my-handle').on('click', function(e){
        e.preventDefault();
        handle = null; 
        socket.disconnect();
        init();
    });
    

   
    var server = holla.createClient({debug:true});

     holla.createFullStream(function(err, stream) {
       //if (err) console.log( err);

       holla.pipe(stream, $(".me"));

      // accept inbound
      server.register(handle, function(worked) {
        server.on("call", function(call) {
          console.log("Inbound call", call);

          call.addStream(stream);
          call.answer();

          call.ready(function(stream) {
            holla.pipe(stream, $(".them"));
          });
          call.on("hangup", function() {
            $(".them").attr('src', '');
          });
          $("#hangup").click(function(){
            call.end();
          });
        });

        //place outbound
        $('.icon-magnet').on('click', function () {
          var toCall = $(this).prev('span').text();
            console.log('Going to call: ' + toCall);

          var call = server.call(toCall);
          call.addStream(stream);
          call.ready(function(stream) {
            holla.pipe(stream, $(".them"));
          });
          call.on("hangup", function() {
            $(".them").attr('src', '');
          });
          $("#hangup").click(function(){
            call.end();
          });
        });

       });
    });

 


    init();

})();
