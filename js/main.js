
(function(){
    var handle = localStorage.getItem('CosmicCharlie-handle');
    var socket = null;
    var room = 'main';
   
    $('#newRoom').val(window.location.hash.substring(1));


    $('#newRoomBtn').on('click', function(e){
        e.preventDefault;
        var data = {
            user: handle
        };
        socket.emit('leaving', data);
        socket.disconnect();    
        establishConnection();
        window.location.hash = $(this).val();
    })

    var establishConnection = function(){
        socket = null;
        options = [];
        options['force new connection'] = true;
        
        socket = io.connect('http://localhost:8080', options);
        
        room = $('#newRoom').val();
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
            var message = '';
            if (data.messageType === 'system'){
                message = "<li style='padding:10px 0px'><span class='alert alert-info'>" + data.message + "</span></li>";
            }else{
                message = "<li style='padding:5px'><strong>"+data.user+"</strong>: " + sanitze(data.message) + "</li>";
            }
            $('#messages').append(message)
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        });
        socket.on('userList', function (data) {
            $('#whos-online').empty();
            $.each(data.users, function(k, handle){
                $('#whos-online').append('<li><i class="icon-user"></i><span style="padding:5px">'+handle+'</span></li>')    
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
		            establishConnection();   
		        }
		    });
		}else{
			console.log(handle);
			establishConnection(); 
		}	
    }
    
    init();

})();
