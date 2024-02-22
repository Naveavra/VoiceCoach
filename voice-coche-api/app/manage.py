
from main import app
from models import db, User

"""
Command-line utility for administrative tasks.
"""

def runserver(host='0.0.0.0', port=5000):
    """Run the development server."""
    app.run(host=host, port=int(port), debug=True)

def createsuperuser(email, password):
    """Create a superuser."""
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        print(f"User with email '{email}' already exists.")
    else:
        new_user = User(email=email, active=True)
        new_user.set_password(password)
        new_user.is_superuser = True
        db.session.add(new_user)
        db.session.commit()
        print(f"Superuser '{email}' created successfully.")

if __name__ == '__main__':
    # check what is the current command and run it by args that have been passed
    # if len(sys.argv) < 2:
    #     print("Please provide a command")
    # else:
    #     command = sys.argv[1]

    #     if command == "runserver":
    #         if len(sys.argv) >= 4:
    #             host = sys.argv[2]
    #             port = sys.argv[3]
    #             runserver(host, port)
    #         elif len(sys.argv) == 3:
    #             host = sys.argv[2]
    #             runserver(host)
    #         else:
    #             runserver()
    #     elif command == "createsuperuser":
    #         if len(sys.argv) < 4:
    #             print("Usage: python script.py createsuperuser <email> <password>")
    #         else:
    #             createsuperuser(sys.argv[2], sys.argv[3])
    #     elif command == "db":
    #         if len(sys.argv) < 3:
    #             print("Usage: python manage.py db <command>")
    #         else:
    #             db_command = sys.argv[2]
    #             if db_command == "init":
    #                 db.create_all()
    #             elif db_command == "drop":
    #                 db.drop_all()
    #             elif db_command == "migrate":
    #                 migrate()
    #             elif db_command == "upgrade":
    #                 upgrade()
    #             else:
    #                 print("Invalid db command")
    #     else:
    #         print("Invalid command")
    manager.run()