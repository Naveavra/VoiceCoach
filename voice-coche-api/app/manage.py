import click
from datetime import datetime
from flask import Flask
from models import  User
from flask.cli import AppGroup

def init_commands(app,users,activate,db):
    users_cli = AppGroup('users',short_help=
                         """create_admin: Creates the admin user.
                            create_user: Creates a new user.\n
                         """, help='Manage user-related operations.')
    activate_cli = AppGroup('activate', help='Manage activation-related operations.')

    @users_cli.command('create_admin')
    @users.cli.command('create_admin')
    @click.option("--email", prompt="Enter email address", help="Admin email")
    @click.option("--password", prompt=True, hide_input=True, confirmation_prompt=True, help="Admin password")
    def create_admin(email, password):
        """Creates the admin user."""
        try:
            user = User(
                email=email,
                username=email.split("@")[0],
                password=password,
                is_admin=True,
                is_confirmed=True,
                confirmed_on=datetime.now(),
            )
            print(user)
            db.session.add(user)
            db.session.commit()
            print(f"Admin with email {email} created successfully!")
        except Exception as e:
            print(f"Error creating admin: {e}")
            print("Couldn't create admin user.")

    # Add the command runserver to the app
    @activate_cli.command('runserver')
    @activate.cli.command('runserver')
    def runserver():
        """Runs the Flask development server."""
        app.run(debug=True, host="localhost")
    
    app.cli.add_command(users_cli)
    app.cli.add_command(activate_cli)

