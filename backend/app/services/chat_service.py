import os
import requests
import json
from app.config import Config
from app.models.user import UserModel
from app.models.mess import MessModel
from app.models.laundry import LaundryModel
from app.services.matching_service import MatchingService

class ChatService:
    @staticmethod
    def get_chat_response(user_id, prompt):
        # Fetch Data context logic natively interacting with Database DAO layers
        user_data = UserModel.get_user_by_id(user_id)
        if not user_data:
            raise ValueError("User not found context")
            
        matches = MatchingService.get_top_matches(user_id)
        mess_bookings = MessModel.get_user_bookings(user_id)
        laundry_bookings = LaundryModel.get_user_bookings(user_id)
        
        # Serialize structures safely avoiding JSON decoding traps on arbitrary Time objects
        try:
            mess_str = json.dumps([{"date": str(b['booking_date']), "type": b['meal_type']} for b in mess_bookings])
            laundry_str = json.dumps([{"date": str(b['booking_date']), "time": str(b['slot_time']), "status": b['status']} for b in laundry_bookings])
        except Exception as err:
            mess_str = "Unavailable"
            laundry_str = "Unavailable"

        system_prompt = f"""
        You are an intelligent AI Hostel Roommate and Schedule Assistant.
        The current user tracking context:
        - Name: {user_data['name']}
        - Cleanliness: {user_data['cleanliness']}/10, Social: {user_data['social']}/10, Sleep: {user_data['sleep']}/10
        - Trust Score: {user_data.get('trust_score', 100)}
        - Top Roommate Matches: {json.dumps(matches)}
        - Upcoming Mess Meals: {mess_str}
        - Laundry Schedule: {laundry_str}
        
        Answer their queries concisely. Be friendly and helpful! 
        If they ask about roommates, reference their matches vector properties uniquely to explain why you recommended them! 
        If they ask about their active schedule (food/laundry), reference their bookings array accurately!
        """

        headers = {
            "Authorization": f"Bearer {Config.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Hostel Super App"
        }

        # Try models in order until one works (verified live on OpenRouter)
        FREE_MODELS = [
            "openai/gpt-oss-120b:free",       # confirmed working
            "openai/gpt-oss-20b:free",
            "google/gemma-3-12b-it:free",
            "google/gemma-3-4b-it:free",
            "meta-llama/llama-3.2-3b-instruct:free",
        ]

        last_error = "No models available"
        for model_name in FREE_MODELS:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ]
            }
            try:
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                if response.status_code == 200:
                    data = response.json()
                    return data['choices'][0]['message']['content']
                else:
                    last_error = response.text
                    print(f"[Chat] Model {model_name} failed ({response.status_code}): {response.text[:200]}")
                    continue
            except Exception as e:
                last_error = str(e)
                print(f"[Chat] Model {model_name} exception: {e}")
                continue

        # All models failed
        print(f"[Chat] All models failed. Last error: {last_error}")
        try:
            err_json = __import__('json').loads(last_error)
            readable = err_json.get('error', {}).get('message', last_error)
        except Exception:
            readable = last_error
        return f"Sorry, the AI assistant is temporarily unavailable. ({readable[:120]})"

