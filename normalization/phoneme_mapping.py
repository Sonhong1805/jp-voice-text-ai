"""
Phoneme mapping and vocabulary normalization.
Ensures that both G2P (PyOpenJTalk) and ASR (Wav2Vec2) phonemes are mapped
to a canonical phoneme set before alignment and evaluation.

Since the Wav2Vec2 model 
eazon-research/japanese-wav2vec2-large is trained
on the native PyOpenJTalk phoneme set, the mapping is currently 1-to-1.
"""

from typing import List

# The canonical phoneme set based on PyOpenJTalk/Wav2Vec2.
CANONICAL_PHONEMES = {
    "A", "E", "I", "N", "O", "U", "a", "b", "by", "ch", "cl", "d", "dy", "e", 
    "f", "g", "gy", "h", "hy", "i", "j", "k", "ky", "m", "my", "n", "ny", "o", 
    "p", "py", "r", "ry", "s", "sh", "t", "ts", "ty", "u", "v", "w", "y", "z"
}

def to_canonical(phoneme: str) -> str:
    """
    Maps a raw phoneme string to the canonical phoneme representation.
    Returns the phoneme itself if valid, or an empty string if it's not a recognized phoneme.
    """
    p = phoneme.strip()
    if p in CANONICAL_PHONEMES:
        return p
    return ""

def filter_and_map_phonemes(phonemes: List[str]) -> List[str]:
    """
    Filters out pauses and maps a list of phonemes to canonical phonemes.
    """
    result = []
    for p in phonemes:
        # Ignore pauses
        if p in ["pau", "sil", "sp"]:
            continue
        
        mapped = to_canonical(p)
        if mapped:
            result.append(mapped)
    return result
