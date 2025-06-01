from app import create_app
from models import db, User
from werkzeug.security import check_password_hash

app = create_app()
app.app_context().push()

email = 'test@example.com'
password = 'password123'

user = User.query.filter_by(email=email).first()

if user and check_password_hash(user.password, password):
    print(f'Authentication successful for user ID: {user.id}')
else:
    print('Authentication failed')
