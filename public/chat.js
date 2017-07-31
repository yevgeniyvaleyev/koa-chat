// publish.onsubmit = function() {
//     const xhr = new XMLHttpRequest();
//
//     xhr.open("POST", "/publish", true);
//
//     xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
//     xhr.send(JSON.stringify({message: this.elements.message.value}));
//
//     this.elements.message.value = '';
//
//     return false;
// };

// subscribe();
//
// function subscribe() {
//     const xhr = new XMLHttpRequest();
//
//     xhr.open("GET", "/subscribe?r=" + Math.random(), true);
//
//     xhr.onload = function() {
//         if(xhr.status != 200) return this.onerror();
//
//         const li = document.createElement('li');
//         li.textContent = this.responseText;
//         messages.appendChild(li);
//
//         subscribe();
//     };
//
//     xhr.onerror = xhr.onabort = function() {
//         setTimeout(subscribe, 500);
//     };
//
//     xhr.send();
// }

const socket = io();

// function showStatus(status, message) {
//     document.querySelector('[data-status]').innerHTML = message || status;
//     document.querySelector('[data-status]').setAttribute('data-status', status);
// }

socket.on('error', function(message) {
        console.error(message);
        showStatus('error', message);
    });


publish.onsubmit = function() {

    socket.emit('publish', this.elements.message.value);
    this.elements.message.value = '';

    return false;
};

// socket.on('logout', function(data) {
//     socket.disconnect();
//     alert("You logged out");
//     window.location.reload();
// })

socket.on('message', function(message, cb) {
    console.log(message);
    const li = document.createElement('li');
    li.textContent = message;
    messages.appendChild(li);
    // cb("<from client>");
});