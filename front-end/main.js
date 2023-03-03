(function () {
    const server = 'http://127.0.0.1:3000'
    const socket = io(server);

    const usernameDiv = document.querySelector('#username-div');
    const usernameBtn = document.querySelector('#username-btn');
    const usernameInput = document.querySelector('#username-input');
    const myUsername = document.querySelector('#my-username');

    const messageInput = document.querySelector('#message-input');
    const messageBtn = document.querySelector('#send-btn');
    const messageCount = document.querySelector('#message-count');

    fetch(`${server}/history`).then((res) => {
        return res.json()
    }).then((item) => {
        item.map(function (data) {
            const ul = document.querySelector('#message-list')

            const li = document.createElement('li');
            if (data.username === localStorage.getItem('username')) {
                li.className = "me";
            }
            ul.appendChild(li);

            const nameDiv = document.createElement('div');
            nameDiv.className = "name";
            li.appendChild(nameDiv);

            const nameSpan = document.createElement('span');
            nameSpan.innerHTML = data.username;
            nameDiv.appendChild(nameSpan);

            const messageDiv = document.createElement('div');
            messageDiv.className = "message";
            li.appendChild(messageDiv);

            const messageP = document.createElement('p');
            messageP.innerHTML = data.message;
            messageDiv.appendChild(messageP);

            const messageSpan = document.createElement('span');
            messageSpan.className = "msg-time";
            messageSpan.innerHTML = data.timestamp;
            messageDiv.appendChild(messageSpan);

            ul.insertBefore(li, ul.childNodes[0]);
        })
    });

    socket.on('messageCount', (count) => {
        messageCount.innerHTML = count;
    })

    socket.on('users', (users) => {
        const ul = document.querySelector('#member-list');

        ul.innerHTML = '';
        
        users.map((user) => {

            const li = document.createElement('li');
            ul.appendChild(li);
    
            const nameSpan = document.createElement('span');
            nameSpan.innerHTML = `${user._id} - messages : ${user.count}`
            li.appendChild(nameSpan);

            ul.insertBefore(li, ul.childNodes[0]);
        })       
    })

    socket.on('message', (data) => {
        const ul = document.querySelector('#message-list')

        const li = document.createElement('li');
        if (data.username === localStorage.getItem('username')) {
            li.className = "me";
        }
        ul.appendChild(li);

        const nameDiv = document.createElement('div');
        nameDiv.className = "name";
        li.appendChild(nameDiv);

        const nameSpan = document.createElement('span');
        nameSpan.innerHTML = data.username;
        nameDiv.appendChild(nameSpan);

        const messageDiv = document.createElement('div');
        messageDiv.className = "message";
        li.appendChild(messageDiv);

        const messageP = document.createElement('p');
        messageP.innerHTML = data.message;
        messageDiv.appendChild(messageP);

        const messageSpan = document.createElement('span');
        messageSpan.className = "msg-time";
        messageSpan.innerHTML = data.timestamp;
        messageDiv.appendChild(messageSpan);

        ul.insertBefore(li, ul.childNodes[0]);
    })

    if (localStorage.getItem('username')) {
        usernameDiv.remove();
        myUsername.innerHTML = localStorage.getItem('username');
    }

    usernameInput.addEventListener('input', function (e) {
        e.preventDefault();

        if (usernameInput.value == "") {
            usernameInput.style.background = "red";
        }
        else {
            usernameInput.style.background = "";
        }
    })

    usernameBtn.addEventListener('click', function (e) {
        e.preventDefault();

        if (usernameInput.value != "") {
            localStorage.setItem('username', usernameInput.value);
            usernameDiv.remove();
            myUsername.innerHTML = localStorage.getItem('username');
        }
        else {
            usernameInput.style.background = "red";
        }
    })

    messageBtn.addEventListener('click', function (e) {
        let date = new Date;
        socket.emit('message', ({ message: messageInput.value, username: localStorage.getItem('username'), timestamp: `${date.getHours().toString().padStart(2, '0')}h${date.getMinutes().toString().padStart(2, '0')}` }));
    })

})()