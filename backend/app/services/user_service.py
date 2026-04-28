from app.models.user import UserModel
from app.services.vector_service import VectorService
import pymysql

class UserService:
    
    @staticmethod
    def process_and_save_user(payload):
        """
        Coordinates generating the vector and saving the user instance into the system.
        """
        # 1. Check if user currently exists (optional logic based on email)
        email = payload.get('email')
        existing = UserModel.get_user_by_email(email)
        if existing:
            # For simplicity, returning error string if already submitted.
            # In production, we'd raise a custom Error that the handler catches and formats into 409 Conflict.
            raise ValueError("User with this email has already submitted their game results.")
        
        # 2. Extract game inputs specifically
        game_inputs = {
            'room_choice': payload.get('room_choice'),
            'sleep': payload.get('sleep'),
            'noise': payload.get('noise'),
            'planning': payload.get('planning'),
            'conflict': payload.get('conflict')
        }
        
        # 3. Predict vector
        vector_data = VectorService.calculate_vector(game_inputs)
        
        # 4. Construct Full user payload
        user_db_payload = {
            'name': payload.get('name'),
            'email': payload.get('email'),
            **vector_data
        }
        
        # 5. Delegate to Model
        user_id = UserModel.create_user(user_db_payload)
        
        return {
            "user_id": user_id,
            "vector": vector_data,
            "message": "User game data successfully converted and saved."
        }
