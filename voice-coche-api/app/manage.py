import click
from datetime import datetime
from flask import Flask
from models import  User
from flask.cli import AppGroup

def init_commands(app,users,activate,db):
    
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

    @activate.cli.command('runserver')
    def runserver():
        """Runs the Flask development server."""
        app.run(debug=True, host="localhost")

