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

function handleRegister2(event) {
    event.preventDefault();
    const username = document.getElementById('register-username2').value;
    const password = document.getElementById('register-password2').value;

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

    function handleLogout() {
        fetch('/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function handleChangePassword(event) {
        event.preventDefault(); 

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
    
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
           
        const data = {
            current_password: currentPassword,
            new_password: newPassword
        };
    
        fetch('/change_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
            credentials: 'include',
        })
        .then(response => {    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert('Success: ' + data.response);
                window.location.reload();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    
    }

    function toggleChangePassword() {
        var form = document.getElementById('change-password-form');
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    }

    function toggleRegisterForm() {
        var form = document.getElementById('register-form2');
        if (form.style.display === 'none' || form.style.display === '') {
            form.style.display = 'block';
        } else {
            form.style.display = 'none';
        }
    }
