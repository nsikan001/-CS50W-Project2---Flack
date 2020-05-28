document.addEventListener('DOMContentLoaded', () => {
    // Send message via the return key(enter key)
    let msg = document.querySelector('#user_message');
    msg.addEventListener('keyup', event => {
        event.preventDefault();
        if(event.keyCode === 13){
           document.querySelector('#send_message').click(); 
        } 
    });

    // module for sending messages on the keyup of the return key in flack app
    let msgs = document.querySelector('#my_message');
    msgs.addEventListener('keyup', event => {
        event.preventDefault();
        if(event.keyCode === 13){
           document.querySelector('#sendbutton').click(); 
        } 
    });
})

// from sandeep
// document.addEventListener('DOMContentLoaded', () => {

//     // Make sidebar collapse on click
//     document.querySelector('#show-sidebar-button').onclick = () => {
//         document.querySelector('#sidebar').classList.toggle('view-sidebar');
//     };

//     // Make 'enter' key submit message
//     let msg = document.getElementById("user_message");
//     msg.addEventListener("keyup", function(event) {
//         event.preventDefault();
//         if (event.keyCode === 13) {
//             document.getElementById("send_message").click();
//         }
//     });
// });