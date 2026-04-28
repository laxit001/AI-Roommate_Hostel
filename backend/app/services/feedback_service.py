from app.models.user import UserModel

class FeedbackService:

    @staticmethod
    def process_feedback(target_user_id, feedback_type):
        user = UserModel.get_user_by_id(target_user_id)
        if not user:
            raise ValueError("Target user not found.")
            
        trust_score = user.get('trust_score', 0.0)
        confidence_score = user.get('confidence_score', 1.0)
        complaints_count = user.get('complaints_count', 0)
        penalty_level = user.get('penalty_level', 0)
        
        if feedback_type == 'accurate':
            # Positive reinforcement boosts parameters slightly back up.
            trust_score = min(trust_score + 5.0, 100.0) 
            confidence_score = min(confidence_score + 0.05, 1.0)
            # Slow recovery from penalty.
            if complaints_count > 0:
                complaints_count = max(complaints_count - 1, 0)
                
        elif feedback_type == 'slightly_different':
            trust_score = max(trust_score - 10.0, 0.0)
            confidence_score = max(confidence_score - 0.1, 0.0)
            complaints_count += 1
            
        elif feedback_type == 'very_different':
            trust_score = max(trust_score - 25.0, 0.0)
            confidence_score = max(confidence_score - 0.3, 0.0)
            complaints_count += 3
        else:
            raise ValueError("Invalid feedback type. Valid options: accurate, slightly_different, very_different")
            
        # Determing the penalty logic bounds dynamically
        # Level 0: normal, Level 1: reduced vis, Level 2: limited matches, Level 3: cooldown
        if complaints_count == 0:
            penalty_level = 0
        elif complaints_count <= 2:
            penalty_level = 1
        elif complaints_count <= 5:
            penalty_level = 2
        else:
            penalty_level = 3
            
        # Commit to Database
        UserModel.update_user_stats(target_user_id, trust_score, confidence_score, complaints_count, penalty_level)
        
        return {
            "target_user_id": target_user_id,
            "new_trust_score": round(trust_score, 2),
            "new_confidence_score": round(confidence_score, 2),
            "complaints_count": complaints_count,
            "penalty_level": penalty_level
        }
