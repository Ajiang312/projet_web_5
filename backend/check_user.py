from app import create_app
from models import db, User

app = create_app()
app.app_context().push()

user = User.query.filter_by(email='test@example.com').first()

if user:
    print(f'User ID: {user.id}, Email: {user.email}, Is Admin: {user.is_admin}')
else:
    print('User not found')
