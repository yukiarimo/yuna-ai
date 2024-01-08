from flask import Flask, redirect, url_for, request, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with your secret key

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# User model
class User(UserMixin):
    pass

# User loader function
@login_manager.user_loader
def user_loader(user_id):
    user = User()
    user.id = user_id
    return user

# Routes
@app.route('/')
@login_required
def index():
    return 'Hello, {}!'.format(current_user.get_id())

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Here you should validate the username and password.
        # The following is just an example with hardcoded credentials.
        if username == "john" and password == "hello":
            user = User()
            user.id = username
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password')
    return '''
        <form method="post">
            <p><input type=text name=username>
            <p><input type=password name=password>
            <p><input type=submit value=Login>
        </form>
    '''

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Logged out'

# Error handling
@app.errorhandler(404)
def page_not_found(error):
    return 'This page does not exist', 404

if __name__ == '__main__':
    app.run(debug=True)
