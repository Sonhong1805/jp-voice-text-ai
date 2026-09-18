import os
import shutil
import tempfile
import re
from typing import List, Dict, Any
import pyopenjtalk
from .phoneme_mapping import filter_and_map_phonemes

if os.name == 'nt' and not pyopenjtalk.__file__.isascii():
    try:
        safe_dir = os.path.join(tempfile.gettempdir(), "open_jtalk_dic")
        if not os.path.exists(safe_dir):
            shutil.copytree(pyopenjtalk.OPEN_JTALK_DICT_DIR.decode("utf-8") if isinstance(pyopenjtalk.OPEN_JTALK_DICT_DIR, bytes) else pyopenjtalk.OPEN_JTALK_DICT_DIR, safe_dir)
        pyopenjtalk.OPEN_JTALK_DICT_DIR = safe_dir.encode("utf-8")
    except Exception as e:
        print("Warning: Failed to set safe open_jtalk_dic path:", e)

def get_expected_chunks(text: str) -> List[Dict[str, Any]]:
    """
    Takes Japanese text and returns a structured list of morpheme chunks.
    Each chunk contains:
    - text: Original kanji/kana string
    - kana: Pronunciation kana (from NJD)
    - phonemes: List of canonical phonemes
    - index: Order index
    """
    if not text.strip():
        return []
        
    chunks = []
    res = pyopenjtalk.run_frontend(text)
    
    idx = 0
    for item in res:
        string = item.get('string', '')
        pron = item.get('pron', '')
        
        if not string.strip() or not pron.strip():
            continue
            
        # Get raw phonemes for this morpheme
        raw_phonemes_str = pyopenjtalk.g2p(pron)
        
        if not raw_phonemes_str.strip():
            continue
            
        # Filter and map to canonical phonemes
        canonical_phonemes = filter_and_map_phonemes(raw_phonemes_str.split())
        
        if not canonical_phonemes:
            continue
            
        chunks.append({
            "text": string,
            "kana": pron,
            "phonemes": canonical_phonemes,
            "index": idx
        })
        idx += 1
        
    return chunks

def normalize_and_get_phonemes(text: str) -> str:
    """
    Legacy method for simple space-separated phoneme extraction.
    """
    chunks = get_expected_chunks(text)
    all_phonemes = []
    for c in chunks:
        all_phonemes.extend(c["phonemes"])
    return " ".join(all_phonemes)
