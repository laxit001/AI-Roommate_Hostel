from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import bcrypt
import pyotp
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
from app.config import Config
from app.models.user import UserModel
from app.utils.jwt import generate_token

class AuthService:
    @staticmethod
    def verify_google_oauth(token):
        try:
            # Decode payload directly interacting with Google APIs safely leveraging client ID validation
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), Config.GOOGLE_CLIENT_ID)
            email = idinfo['email']
            name = idinfo.get('name', 'Student User')
            google_id = idinfo['sub']
            
            # Reconcile user natively mapping identity logic seamlessly
            user = UserModel.get_user_by_email(email)
            if not user:
                # If they don't exist, instantiate default empty vector structure bound to verified state
                user_id = UserModel.create_auth_user(name, email, google_id, True)
            else:
                user_id = user['user_id']
                # Sync status natively in database
                UserModel.set_user_verified(user_id)
                UserModel.update_google_id(user_id, google_id)
                
            jwt_token = generate_token(user_id)
            return {"token": jwt_token, "user_id": user_id, "email": email, "name": name}
        except ValueError:
            raise ValueError("Invalid Google OAuth Cryptographic Signature.")

    @staticmethod
    def generate_and_send_otp(email):
        # Generate 6-digit integer natively utilizing strict cryptographic mathematical randomness 
        totp = pyotp.TOTP(pyotp.random_base32())
        otp_code = totp.now()
        
        # Hash inherently blocking direct database enumeration threats
        hashed_otp = bcrypt.hashpw(otp_code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        UserModel.store_otp(email, hashed_otp, expires_at)
        
        # Simulated Console log bounding local development logic if SMTP passwords aren't live deployed
        print(f"\n[{datetime.utcnow()}] SECURE OTP DISPATCHED TO {email} -> CODE: {otp_code}\n")
        
        try:
            msg = EmailMessage()
            msg.set_content(f"Your secure Hostel Verification OTP is: {otp_code}.\nIt is valid for 5 minutes.")
            msg['Subject'] = 'Hostel Platform Account Protocol'
            msg['From'] = Config.SMTP_USER
            msg['To'] = email
            
            # Encapsulate natively blocking execution halts if misconfigured locally by dev
            server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT)
            server.starttls()
            server.login(Config.SMTP_USER, Config.SMTP_PASS)
            server.send_message(msg)
            server.quit()
        except:
            pass # Yielding cleanly

    @staticmethod
    def verify_otp(email, otp_code):
        record = UserModel.get_latest_otp(email)
        if not record:
            raise ValueError("Authorization Context Missing: No active OTP tracked for this email identity.")
            
        if datetime.utcnow() > record['expires_at']:
            raise ValueError("Sequence Timeframe Collapsed: OTP has expired cleanly. Please issue a new challenge.")
            
        if not bcrypt.checkpw(otp_code.encode('utf-8'), record['hashed_otp'].encode('utf-8')):
            raise ValueError("Decryption Collision: Invalid Mathematical Verification Match.")
            
        user = UserModel.get_user_by_email(email)
        if not user:
            # First time user accessing via pure OTP cleanly
            user_id = UserModel.create_auth_user("Student", email, None, True)
        else:
            user_id = user['user_id']
            UserModel.set_user_verified(user_id)
            
        jwt_token = generate_token(user_id)
        return {"token": jwt_token, "user_id": user_id, "email": email}
