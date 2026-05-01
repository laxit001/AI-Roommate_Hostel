import math
from app.models.user import UserModel

class MatchingService:
    # Weighted importance for matching attributes
    WEIGHTS = {
        'cleanliness': 2.0,
        'sleep': 2.0,
        'discipline': 1.5,
        'noise': 1.5,
        'emotional': 1.5,
        'social': 1.0
    }

    @staticmethod
    def _create_weighted_vector(user_data):
        """
        Normalizes the 0-10 user traits to 0-1, then applies the required weights.
        Returns a list representing the vector array.
        """
        vec = []
        for key, weight in MatchingService.WEIGHTS.items():
            val = user_data.get(key, 0.0)
            # Normalize step
            normalized = val / 10.0
            # Apply weight
            vec.append(normalized * weight)
        return vec
        
    @staticmethod
    def _cosine_similarity(vec1, vec2):
        """
        Calculates cosine similarity between two numeric vectors of the same length.
        """
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return dot_product / (norm_a * norm_b)
        
    @staticmethod
    def _generate_explanation(t_user, m_user):
        traits = ['cleanliness', 'sleep', 'discipline', 'noise', 'emotional', 'social']
        deltas = []
        for t in traits:
            # Gather safe differentials preventing KeyErrors
            diff = abs(t_user.get(t, 5) - m_user.get(t, 5))
            deltas.append((diff, t))
            
        # Sort dynamically pointing at the mathematically closest vectors
        deltas.sort(key=lambda x: x[0])
        best, second = deltas[0][1], deltas[1][1]
        
        return f"Matched cleanly due to highly similar {best} expectations and {second} preferences!"

    @staticmethod
    def get_top_matches(user_id):
        """
        Fetches all users, calculates semantic similarity based on psychological vectors,
        adjusts by trust score, and returns the top 5 matches.
        """
        target_user = UserModel.get_user_by_id(user_id)
        if not target_user:
            raise ValueError(f"User with id {user_id} not found.")
            
        all_users = UserModel.get_all_users()
        
        # Precompute the vector for the target
        target_vec = MatchingService._create_weighted_vector(target_user)
        
        matches = []
        for u in all_users:
            if u['user_id'] == user_id:
                continue
                
            u_vec = MatchingService._create_weighted_vector(u)
            similarity = MatchingService._cosine_similarity(target_vec, u_vec)
            
            # Adjustment multiplier
            trust_score = u.get('trust_score', 0)
            confidence_score = u.get('confidence_score', 1.0)
            penalty_level = u.get('penalty_level', 0)
            
            # Level 3 Penalty Cooldown completely excludes them
            if penalty_level == 3:
                continue
                
            final_score = similarity * (trust_score / 100.0) * confidence_score
            
            # Level 1 and Level 2 Penalty Multipliers
            if penalty_level == 1:
                final_score *= 0.8  # Reduced visibility
            elif penalty_level == 2:
                final_score *= 0.5  # Limited matches
                
            matches.append({
                'user_id': u['user_id'],
                'name': u['name'],
                'email': u['email'],
                'similarity_base': round(similarity, 4),
                'trust_score': trust_score,
                'confidence_score': confidence_score,
                'penalty_level': penalty_level,
                'final_score': round(final_score, 4),
                'explanation': MatchingService._generate_explanation(target_user, u)
            })
            
        # Sort descending by final score
        matches.sort(key=lambda x: x['final_score'], reverse=True)
        
        # Return top 5
        return matches[:5]
