# Hostel Roommate Matching System Backend

This is a production-ready Flask backend that implements the logic to convert game-based inputs into a psychological vector for a roommate matching system.

## Setup Instructions

1. **Install Dependencies**
   It's recommended to use a virtual environment.
   ```bash
   pip install -r requirements.txt
   ```

2. **Database Setup**
   Ensure MySQL is running.
   Create the database and table using `schema.sql`:
   ```bash
   mysql -u root -p < schema.sql
   ```
   
   If your MySQL credentials differ, set the following environment variables (or rely on defaults in `app/config.py`):
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`

3. **Running the Application**
   ```bash
   python run.py
   ```
   
   The server will start on `http://localhost:5000`.

## Endpoints
- `POST /api/submit-game`
  Accepts a JSON payload containing game behavioral inputs (`room_choice`, `sleep`, `noise`, `planning`, `conflict`), along with `name` and `email`.

- `GET /api/matches/<user_id>`
  Fetches the top 5 optimal roommate matches for a user using an AI algorithm powered by weighted cosine similarity.

  **Example Response JSON:**
  ```json
  {
      "status": "success",
      "target_user_id": 1,
      "top_matches": [
          {
              "user_id": 4,
              "name": "Jane Smith",
              "email": "jane@example.com",
              "similarity_base": 0.9854,
              "trust_score": 9.5,
              "final_score": 0.0936
          }
      ]
  }
  ```
