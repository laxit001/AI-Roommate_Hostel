from app.db import get_db_connection


class UserModel:
    """
    Data Access Object for the `users` table.
    """

    @staticmethod
    def create_user(user_data):
        """
        Inserts a new user with full vector data.
        :param user_data: dict with name, email, and 6 trait fields + trust_score
        :return: user_id (int) of inserted row
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO users (
                        name, email, cleanliness, discipline,
                        social, noise, sleep, emotional, trust_score
                    ) VALUES (
                        %(name)s, %(email)s, %(cleanliness)s, %(discipline)s,
                        %(social)s, %(noise)s, %(sleep)s, %(emotional)s, %(trust_score)s
                    )
                """
                cursor.execute(sql, user_data)
            connection.commit()
            return cursor.lastrowid
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()

    @staticmethod
    def get_user_by_email(email):
        """Retrieves a user record by email address."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def create_auth_user(name, email, google_id, is_verified):
        """
        Creates a minimal user record for OAuth/OTP sign-ins.
        All trait columns are set to sensible defaults (5.0) so the
        profile and matching engine never encounter NULL values.
        """
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO users (
                        name, email, google_id, is_verified,
                        cleanliness, discipline, social, noise, sleep, emotional,
                        trust_score, confidence_score, complaints_count, penalty_level
                    ) VALUES (%s, %s, %s, %s, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 100.0, 1.0, 0, 0)
                """
                cursor.execute(sql, (name, email, google_id, is_verified))
            connection.commit()
            return cursor.lastrowid
        finally:
            connection.close()

    @staticmethod
    def get_user_by_id(user_id):
        """Retrieves a user by primary key."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def get_all_users():
        """Retrieves all users — used by the matching engine."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users")
                return cursor.fetchall()
        finally:
            connection.close()

    @staticmethod
    def set_user_verified(user_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET is_verified = TRUE WHERE user_id = %s",
                    (user_id,)
                )
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def update_google_id(user_id, google_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET google_id = %s WHERE user_id = %s",
                    (google_id, user_id)
                )
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def store_otp(email, hashed_otp, expires_at):
        """Stores a new OTP record, invalidating any previously unused ones."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                # Mark all previous OTPs for this email as used
                cursor.execute(
                    "UPDATE otp_codes SET used = TRUE WHERE email = %s AND used = FALSE",
                    (email,)
                )
                cursor.execute(
                    "INSERT INTO otp_codes (email, hashed_otp, expires_at) VALUES (%s, %s, %s)",
                    (email, hashed_otp, expires_at)
                )
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def get_latest_otp(email):
        """Gets the most recent unused OTP record for an email."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM otp_codes WHERE email = %s AND used = FALSE ORDER BY created_at DESC LIMIT 1",
                    (email,)
                )
                return cursor.fetchone()
        finally:
            connection.close()

    @staticmethod
    def mark_otp_used(otp_id):
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE otp_codes SET used = TRUE WHERE id = %s", (otp_id,))
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def update_user_profile(user_id, name, c, d, so, n, sl, e):
        """Updates the user's name and all 6 personality trait values."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    UPDATE users
                    SET name=%s, cleanliness=%s, discipline=%s,
                        social=%s, noise=%s, sleep=%s, emotional=%s
                    WHERE user_id=%s
                """
                cursor.execute(sql, (name, c, d, so, n, sl, e, user_id))
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def update_user_stats(user_id, trust_score, confidence_score, complaints_count, penalty_level):
        """Updates trust score and behavioral variables."""
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                sql = """
                    UPDATE users
                    SET trust_score = %s,
                        confidence_score = %s,
                        complaints_count = %s,
                        penalty_level = %s
                    WHERE user_id = %s
                """
                cursor.execute(sql, (trust_score, confidence_score, complaints_count, penalty_level, user_id))
            connection.commit()
        finally:
            connection.close()
