const socket = io()

// DOM elements
const message = document.getElementById('message'),
        username = document.getElementById('username'),
        output = document.getElementById('output'),
        actions = document.getElementById('actions'),
        button = document.getElementById('button');

        // send message clients
        button.addEventListener('click', function () {
            console.log('click');
            console.log(username.value, message.value);
            socket.emit('chat:message',{
                username: username.value,
                message: message.value
            })

        })

        // listen for events from the server
        socket.on('chat:message', function (data) {
            actions.innerHTML = '';
            output.innerHTML += `<p>
            <strong>${data.username}</strong>: ${data.message}
            </p>`
        })

        //send typing message
        message.addEventListener('keypress', function () {
            console.log(username.value);
            socket.emit('chat:typing',username.value);
        })

        socket.on('chat:typing', function (data) {
            actions.innerHTML=`<p><em>${data} is typing... </em></p>`
        })

//Video chat
//----------------------------------------------------------------------------------------------------------
// get the local video and display iit with permission
function getLVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
        audio:true,
        video:true
    }
    navigator.getUserMedia(constraints,callbacks.success, callbacks.error)
}
//create function 
function recStream(stream, elemid){
    var video=document.getElementById(elemid);
    video.srcObject = stream;
    window.peer_stream = stream;

}
getLVideo({
    success: function(stream){
        window.localstream = stream;
        recStream(stream, 'lvideo');
    },
    error: function(err){
        alert("cannot access your camera");
        console.log(err);
    }
})

var conn;
var peer_id;

// create a peer connection with peer obj
var peer = new Peer({key: 'lwjd5qra8257b9'});

// display the peer id on the DOM
peer.on('open', function() {
    document.getElementById("displayId").innerHTML = peer.id
  });

  peer.on('connetion', function(connection){
      conn = connection;
      peer_id = connection.peer
      document.getElementById('connId').value = peer_id;
  });
  peer.on('error', function(err){
      alert("an error has happened:"+err);
      console.log(err);
  })

  //onclick with the connection butt = espose ice info
  document.getElementById('conn_button').addEventListener('click', function(){
      peer_id=document.getElementById("connId").value;
      if(peer_id){
          conn = peer.connect(peer_id)
      }else{
          alert("enter an id");
          return false;
      }
    })

  // call on clic (offer and answer is exhanged)
  peer.on('call', function(call){
      var acceptCall = confirm("Do you want to answer this call?");
      if(acceptCall){
          call.answer(window.localstream);
          call.on('stream', function(stream){
            window.peer_stream=stream;
            recStream(stream, 'rvideo')
          });
          call.on('close', function(){
            alert('');
          });

        }else{
            console.log('Call denied')
        }
  });

  // ask to call

  document.getElementById('call_button').addEventListener('click', function(){
    console.log("call a peer: "+peer_id);
    console.log(peer);
    var call = peer.call(peer_id,window.localstream);
    call.on('stream',function(stream){
        window.peer_id = stream;
        recStream(stream, 'svideo');
    })
  })

