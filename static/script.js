// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Creating the websocket for real-time connection between server and client
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    // Grabing the client's local storage
    var client_storage = window.localStorage;
    // Module to execute when the user connects to the websocket
    socket.on('connect', () => {
        if (client_storage.getItem('channel')) {
        
            socket.emit("join_channel", client_storage.getItem('channel'));
        }
        else {
            document.querySelector("#chat_msg").style.display = "none";
        }
        // Module to check and enable/disable the username form and channel form if user if the user exists or not
        if(!client_storage.getItem('username')) {
            document.querySelector("#uname_btn").disabled = false;
            document.querySelector("#create_btn").disabled = true;
            document.querySelector("#channel_list").style.display = "none";
        }
        else {
            document.querySelector("#uname_btn").disabled = true;
            document.querySelector("#create_btn").disabled = false;
            document.querySelector("#channel_list").style.display = "block";
            socket.emit("username", client_storage.getItem("username"));
        }
        
    });

    // Module to execute when a user joins the channel
    socket.on('join_channel', data => {
        // Subroutine to save the channel in the client's memory 
        client_storage.setItem('channel', data["channel"]);
        // Subroutine to clear the messages area
        document.querySelector("#messages").innerHTML = "";
        // Subroutine to use the channel as the chat's title
        document.querySelector("#chat_title").innerHTML = data["channel"];
        // Subroutine to take the user to the room
        document.querySelector("#chat_msg").style.display = "block";
        // Subroutine to fill up the messages area with the channel's messages
        var x;
        for (x in data["messages"]) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${data["messages"][x].user}:</strong> <div><span>${data["messages"][x].msg}</span></div> <small>${data["messages"][x].my_time}</small>`;
            document.querySelector("#messages").append(li);
        }
    });

    // Module to execute when the user leaves a channel
    socket.on('leave_channel', channel => {
        client_storage.removeItem("channel");
        document.querySelector("#chat_title").innerHTML = "";
        document.querySelector("#chat_msg").style.display = "none";
    });

    // Sobroutine that executes when the leave channel button is clicked
    document.querySelector("#leave_channel").onclick = () => {
        socket.emit("leave_channel", client_storage.getItem("channel"));
    };

    // Module to execute if there's an error in creating a channel
    socket.on('channel_error', msg => {
        alert(msg);
    });

    // Module for sent messages
    socket.on('room_message', data => {
        console.log("Message received!");
        // Displays messages for all users on the channel
        const li = document.createElement('li');
        li.innerHTML = `<strong>${data.user}:</strong> <div><span>${data.msg}</span></div> <small>(${data.my_time})</small>`;
        document.querySelector("#messages").append(li);
    });

    // Module to execute when the send button is clicked
    document.querySelector("#sendbutton").onclick = () => {
        // Send a JSON dictionary to the server carrying the channel, message and the username 
        msg = document.querySelector("#my_message").value;
        user = client_storage.getItem('username');
        const channel = client_storage.getItem('channel');
        socket.emit('room_message',{'msg': msg, 'user': user, 'channel': channel});
        document.querySelector("#my_message").value = '';
    };

    
    // Module that executes when an item of the channel is clicked
    document.querySelectorAll(".my_channel").forEach(li => {
        li.onclick = () => {
            socket.emit('change_channel', client_storage.getItem('channel'), li.dataset.channel);
        };
    });

    // Module for the username form submission
    document.querySelector("#uname_form").onsubmit =  () => {
        // Subroutine to save the username in the local storage
        client_storage.setItem('username', document.querySelector("#uname").value);
        // Subroutine to disable the username form
        document.querySelector("#uname_btn").disabled = true;
        // Subroutine to enable the channel creation form
        document.querySelector("#create_btn").disabled = false;
        document.querySelector("#channel_list").style.display = "block";
        document.querySelector("#uname").value = "";
        socket.emit("username", client_storage.getItem('username'));
        // Subroutine to prevent form submission
        return false;

    };

    // Module to execute when the create channel form is submitted
    document.querySelector("#create_channel").onsubmit = () => {
        const channel = document.querySelector("#channel").value;
        socket.emit("channel_creation", channel);
        return false;
    };

    // Module for file upload

   // Subroutine to add change event listener to file_input element
   document.getElementById('file_input').addEventListener('change', function(event) {

    // Grabing the file data from file_input
    const file_input = document.getElementById('file_input');
    const file = file_input.files[0];

    // Subroutine to ensure file size is not greater than 20MB 
    if (file.size > 20000000) {

      alert("File size must not be more than 20MB");
      document.getElementById('file_input').value = '';

    // Subroutine to read file slice as array buffer and emit to server
    } else {

      const reader = new FileReader();
      const size = file.size;
      console.log(size);
      
      const slice = file.slice(0, size);
      reader.readAsArrayBuffer(slice);

      reader.onload = function(event) {

        const file_data = reader.result;
        socket.emit('file upload', {'sender': client_storage.getItem('username'), 'room': client_storage.getItem('channel'), 'name': file.name, 'type': file.type, 'size': file.size, 'data': file_data});
      };
    };

  });

   // Interfacing the file received event from server
   socket.on('file received', function(data) {

    // converting the file data from array buffer to blob
    const received_file = new Blob([data.data]);

    //Module to generate a download URL for file object within browser
    const dl_link = document.createElement('a');
    const dl_url = window.URL.createObjectURL(received_file);
    dl_link.setAttribute('href', dl_url);
    dl_link.setAttribute('download', data.name);
    dl_link.innerHTML = 'download';

    const file_share = document.createElement('div');
    file_share.innerHTML = data.sender + ' shared a file - "' + data.name + '" - ';

    if (data.sender == localStorage.getItem('display')) {
      file_share.setAttribute('class', 'my_message');
      document.getElementById('file_input').value = '';
    };

    // Subroutine to append file download link to message 
    file_share.appendChild(dl_link);
    document.querySelector('#messages').append(file_share);

  });

});