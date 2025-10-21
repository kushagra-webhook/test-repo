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

if __name__ == "__main__":
    # Demonstrate command injection
    user_input = input("Enter your name: ")
    print(run_command(user_input))
    
    # Log sensitive information
    log_sensitive_info()
    
    # Create insecure temporary file
    temp_file = create_temp_file()
    print(f"Created temporary file: {temp_file}")
