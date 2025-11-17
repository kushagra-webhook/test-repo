"""
This file contains intentional security issues for testing security analysis tools.
"""
import os
import subprocess
import pickle
import base64

# Hardcoded credentials (Security issue: Hardcoded secret)
API_KEY = "s3cr3t_k3y_12345"
DB_PASSWORD = "db@admin#pass"

# Command injection vulnerability
def run_command(user_input):
    """Run a command with user input (vulnerable to command injection)."""
    return subprocess.check_output(f"echo {user_input}", shell=True)  # Shell injection vulnerability

# SQL injection vulnerability
def query_database(query):
    """Execute a database query (vulnerable to SQL injection)."""
    import sqlite3
    conn = sqlite3.connect('example.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE username = '{query}'")
    return cursor.fetchall()

# Insecure deserialization
def deserialize_data(serialized_data):
    """Deserialize data (vulnerable to arbitrary code execution)."""
    return pickle.loads(base64.b64decode(serialized_data))

# Hardcoded encryption key (Security issue: Insecure key management)
ENCRYPTION_KEY = b'ThisIsAVeryInsecureKey123!'

def encrypt_data(data):
    """Encrypt data with hardcoded key (insecure implementation)."""
    from cryptography.fernet import Fernet
    cipher_suite = Fernet(ENCRYPTION_KEY)
    return cipher_suite.encrypt(data.encode())

# Sensitive data in logs
def log_sensitive_info():
    """Log sensitive information (Security issue: Information exposure)."""
    import logging
    logging.basicConfig(level=logging.INFO)
    logging.info(f"User logged in with token: {API_KEY}")

# Insecure temporary file
def create_temp_file():
    """Create a temporary file (vulnerable to race conditions)."""
    import tempfile
    temp = tempfile.mktemp()
    with open(temp, 'w') as f:
        f.write("Temporary data")
    return temp

def hash_password_insecure(password):
    """
    Insecure password hashing using MD5 (vulnerable to rainbow table attacks).
    WARNING: This is intentionally vulnerable for testing purposes.
    """
    import hashlib
    # Using MD5 which is cryptographically broken (Security issue)
    return hashlib.md5(password.encode()).hexdigest()

def verify_jwt_token(token):
    """
    Insecure JWT verification (vulnerable to signature bypass).
    WARNING: This is intentionally vulnerable for testing purposes.
    """
    import jwt
    
    # Hardcoded secret key (Security issue)
    JWT_SECRET = 'insecure_secret_key_12345'
    
    try:
        # Decode without verifying the signature (Security issue)
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Verify expiration manually (but signature is already not verified)
        if 'exp' in decoded and decoded['exp'] < int(time.time()):
            print("Token has expired")
            return None
            
        return decoded
    except Exception as e:
        print(f"JWT verification error: {str(e)}")
        return None

if __name__ == "__main__":
    # Demonstrate command injection
    user_input = input("Enter your name: ")
    print(run_command(user_input))
    
    # Log sensitive information
    log_sensitive_info()
    
    # Create insecure temporary file
    temp_file = create_temp_file()
    print(f"Created temporary file: {temp_file}")
    
    # Test JWT verification (vulnerable)
    test_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o"
    user_data = verify_jwt_token(test_token)
    print(f"Decoded user data: {user_data}")
    
    # Test insecure password hashing
    password = "myp@ssw0rd123"
    hashed = hash_password_insecure(password)
    print(f"Insecurely hashed password: {hashed}")
