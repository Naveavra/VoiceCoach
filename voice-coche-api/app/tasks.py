
from datetime import timedelta
import datetime
from models import User
import random



def delete_unconfirmed_users(app,db):
    with app.app_context():
        # Perform database operation to delete unconfirmed users older than a week
        users_to_delete = User.query.filter(User.is_confirmed == False, User.created_at < (datetime.now() - timedelta(days=7))).all()
        for user in users_to_delete:
            db.session.delete(user)
        db.session.commit()
        print("Unconfirmed users older than a week deleted")

