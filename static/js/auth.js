function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.response === 'Login successful') {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            window.location.reload();

        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.response === 'User created successfully') {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            window.location.reload();
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function checkLoginStatus() {
    fetch('/check_login')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                if (data.users_exist) {
                    document.getElementById('login-form').style.display = 'block';
                } else {
                    document.getElementById('register-form').style.display = 'block';
                }
                document.getElementById('main').style.display = 'none';
            }
        })
    }