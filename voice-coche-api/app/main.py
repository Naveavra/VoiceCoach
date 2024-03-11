import sys
from init import create_app

try:
    app = create_app()
except RuntimeError as e:
    print(f"Error: {e}")
    # Handle the database connection error by shutting down the program
    exit(1)

