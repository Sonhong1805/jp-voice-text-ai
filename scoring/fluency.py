import math
from typing import List, Dict, Any

def count_mora(phonemes: list[str]) -> int:
    """
    Counts the number of moras in a sequence of Japanese phonemes.
    Vowels (A, E, I, O, U, a, e, i, o, u), moraic nasal (N), and moraic obstruent (cl) count as 1 mora.
    """
    mora_phonemes = {'A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', 'N', 'cl'}
    return sum(1 for p in phonemes if p in mora_phonemes)

def calculate_speech_rate_score(mora_count: int, audio_duration: float) -> float:
    if audio_duration <= 0 or mora_count == 0:
        return 0.0
        
    rate = mora_count / audio_duration
    
    # Constants for Japanese speech rate
    # Average is around 6-7 mora/sec.
    r_ref = 6.0
    sigma_r = 2.0
    
    # 100 * exp(- |r - r_ref| / sigma_r)
    score = 100.0 * math.exp(- abs(rate - r_ref) / sigma_r)
    return max(0.0, min(100.0, score))

def calculate_pause_score(phoneme_chunks: List[Dict[str, Any]], audio_duration: float) -> float:
    """
    Calculates pause score by penalizing unexpected pauses (gaps > 300ms) between phoneme chunks.
    """
    if not phoneme_chunks or audio_duration <= 0:
        return 100.0
        
    unexpected_pause_duration = 0.0
    pause_threshold = 0.3 # 300 ms
    
    for i in range(1, len(phoneme_chunks)):
        prev_end = phoneme_chunks[i-1]["timestamp"][1]
        curr_start = phoneme_chunks[i]["timestamp"][0]
        
        gap = curr_start - prev_end
        if gap > pause_threshold:
            # We count the entire gap as unexpected pause
            unexpected_pause_duration += gap
            
    score = 100.0 * (1.0 - (unexpected_pause_duration / audio_duration))
    return max(0.0, min(100.0, score))

def calculate_fluency(phonemes: list[str], phoneme_chunks: List[Dict[str, Any]], audio_duration: float) -> float:
    mora_count = count_mora(phonemes)
    rate_score = calculate_speech_rate_score(mora_count, audio_duration)
    pause_score = calculate_pause_score(phoneme_chunks, audio_duration)
    
    # 60% Rate, 40% Pause
    fluency = 0.6 * rate_score + 0.4 * pause_score
    return max(0.0, min(100.0, fluency))
