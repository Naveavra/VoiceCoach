import sys
from init import create_app

try:
    app, socketio = create_app()
except RuntimeError as e:
    print(f"Error: {e}")
    # Handle the database connection error by shutting down the program
    exit(1)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
