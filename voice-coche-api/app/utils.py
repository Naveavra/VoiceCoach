from cryptography.fernet import Fernet
import base64

# Generate a secret key for encryption (This should be done once and stored securely)
SECRET_KEY = Fernet.generate_key()
cipher_suite = Fernet(SECRET_KEY)

def generate_hash(project_id):
    project_id_bytes = str(project_id).encode('utf-8')
    # Encrypt the project_id
    encrypted_id = cipher_suite.encrypt(project_id_bytes)
    # Encode the encrypted bytes to a URL-safe base64 string
    return base64.urlsafe_b64encode(encrypted_id).decode('utf-8')