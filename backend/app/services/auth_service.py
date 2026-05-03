from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import bcrypt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.config import Config
from app.models.user import UserModel
from app.utils.jwt import generate_token


class AuthService:

    @staticmethod
    def verify_google_oauth(token):
        """Verify Google ID token and return JWT."""
        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                Config.GOOGLE_CLIENT_ID
            )
            email = idinfo['email']
            name = idinfo.get('name', 'Student')
            google_id = idinfo['sub']

            user = UserModel.get_user_by_email(email)
            if not user:
                user_id = UserModel.create_auth_user(name, email, google_id, True)
            else:
                user_id = user['user_id']
                UserModel.set_user_verified(user_id)
                UserModel.update_google_id(user_id, google_id)

            jwt_token = generate_token(user_id)
            return {
                "token": jwt_token,
                "user_id": user_id,
                "email": email,
                "name": name
            }
        except ValueError:
            raise ValueError("Invalid Google OAuth token signature.")

    @staticmethod
    def generate_and_send_otp(email):
        """
        Generate a secure 6-digit OTP, bcrypt-hash it, store it,
        and send it via email. Falls back to console log if SMTP fails.
        """
        # Generate a cryptographically random 6-digit code
        otp_code = str(secrets.randbelow(1_000_000)).zfill(6)

        # Hash before storing — never store plaintext OTPs
        hashed_otp = bcrypt.hashpw(
            otp_code.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        expires_at = datetime.utcnow() + timedelta(minutes=10)
        UserModel.store_otp(email, hashed_otp, expires_at)

        # Always print to console for local development
        print(f"\n[OTP] Code for {email}: {otp_code}  (expires in 10 min)\n")

        # Attempt to send via SMTP (silently fails if misconfigured)
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = '🏠 Your Hostel Login Code'
            msg['From'] = Config.SMTP_USER
            msg['To'] = email

            html_body = f"""
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
              <h2 style="color:#4f46e5;margin-bottom:8px;">Hostel Super App</h2>
              <p style="color:#64748b;">Your one-time login code is:</p>
              <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#1e293b;
                          background:#e0e7ff;padding:24px;border-radius:12px;text-align:center;margin:24px 0;">
                {otp_code}
              </div>
              <p style="color:#64748b;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
            """
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT)
            server.starttls()
            server.login(Config.SMTP_USER, Config.SMTP_PASS)
            server.send_message(msg)
            server.quit()
            print(f"[OTP] Email sent successfully to {email}")
        except Exception as smtp_err:
            # SMTP failure is non-fatal — OTP is still in DB and printed to console
            print(f"[OTP] SMTP failed (check .env): {smtp_err}")

    @staticmethod
    def verify_otp(email, otp_code):
        """
        Validate the submitted OTP against the stored bcrypt hash.
        Returns JWT token on success.
        """
        record = UserModel.get_latest_otp(email)
        if not record:
            raise ValueError("No active OTP found for this email. Please request a new one.")

        if record.get('used'):
            raise ValueError("This OTP has already been used. Please request a new one.")

        # Convert expires_at to naive UTC datetime for comparison
        expires_at = record['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.strptime(expires_at, '%Y-%m-%d %H:%M:%S')
        if datetime.utcnow() > expires_at:
            raise ValueError("OTP has expired. Please request a new code.")

        if not bcrypt.checkpw(
            otp_code.encode('utf-8'),
            record['hashed_otp'].encode('utf-8')
        ):
            raise ValueError("Invalid OTP. Please check the code and try again.")

        # Mark OTP as used to prevent replay attacks
        UserModel.mark_otp_used(record['id'])

        # Upsert user record
        user = UserModel.get_user_by_email(email)
        if not user:
            user_id = UserModel.create_auth_user("Student", email, None, True)
            name = "Student"
        else:
            user_id = user['user_id']
            name = user.get('name', 'Student')
            UserModel.set_user_verified(user_id)

        jwt_token = generate_token(user_id)
        return {
            "token": jwt_token,
            "user_id": user_id,
            "email": email,
            "name": name
        }
