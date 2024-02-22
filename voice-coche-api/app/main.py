import sys
from init import create_app
skip_creation = "--skip" in sys.argv
try:
    app = create_app(skip_create_tables=skip_creation)
except RuntimeError as e:
    print(f"Error: {e}")
    # Handle the database connection error by shutting down the program
    exit(1)

if __name__ == '__main__':
    app.run(debug=True ,host="localhost")
