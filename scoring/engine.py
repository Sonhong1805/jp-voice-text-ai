from typing import List, Dict, Any, Optional
from .fluency import calculate_fluency
from .alignment import align_phonemes
from normalization.g2p import get_expected_chunks
from normalization.phoneme_mapping import filter_and_map_phonemes
from .prosody import calculate_prosody_score
import numpy as np

def evaluate_pronunciation(
    expected_text: str, 
    actual_phonemes_str: str, 
    actual_phoneme_chunks: List[Dict[str, Any]], 
    audio_duration: float,
    user_audio_data: Optional[np.ndarray] = None,
    ref_audio_data: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    expected_chunks = get_expected_chunks(expected_text)
    actual_phonemes_raw = actual_phonemes_str.split() if actual_phonemes_str else []
    actual_phonemes = filter_and_map_phonemes(actual_phonemes_raw)
    
    updated_chunks, editops = align_phonemes(expected_chunks, actual_phonemes)
    
    flat_expected_len = sum(len(c['phonemes']) for c in expected_chunks)
    actual_len = len(actual_phonemes)
    
    num_subs = sum(1 for op in editops if op[0] == 'replace')
    num_ins = sum(1 for op in editops if op[0] == 'insert')
    num_dels = sum(1 for op in editops if op[0] == 'delete')
    
    num_matches = flat_expected_len - num_subs - num_dels
    
    attempted = num_matches + num_subs + num_ins
    if attempted == 0:
        phoneme_acc = 0.0
    else:
        phoneme_acc = 100.0 * num_matches / attempted
        
    if flat_expected_len == 0:
        completeness = 100.0 if actual_len == 0 else 0.0
    else:
        attempted_expected = flat_expected_len - num_dels
        completeness = 100.0 * (attempted_expected / flat_expected_len)
        
    fluency_base = calculate_fluency(actual_phonemes, actual_phoneme_chunks, audio_duration)
    
    # Tính điểm Prosody (Ngữ điệu/Nhịp điệu) nếu có đủ audio
    prosody_score = 100.0
    if user_audio_data is not None and ref_audio_data is not None:
        prosody_score = calculate_prosody_score(ref_audio_data, user_audio_data)
        # Blend prosody vào fluency (Ví dụ: 70% Fluency cũ, 30% Prosody mới)
        fluency = 0.7 * fluency_base + 0.3 * prosody_score
    else:
        fluency = fluency_base
        
    overall = 0.5 * phoneme_acc + 0.2 * completeness + 0.3 * fluency
    
    errors = analyze_errors(updated_chunks)
    
    return {
        'scores': {
            'phoneme': round(phoneme_acc, 2),
            'completeness': round(completeness, 2),
            'fluency': round(fluency, 2),
            'overall': round(overall, 2)
        },
        'alignment': updated_chunks,
        'errors': errors,
        'feedback': [],
        'editops': editops
    }

def analyze_errors(aligned_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    errors = []
    
    for chunk in aligned_chunks:
        if chunk.get('color') == 'gray':
            errors.append({
                'word': chunk['text'],
                'token': '',
                'type': 'missing',
                'severity': 'info',
                'message': f"Chưa đọc: {chunk['text']}",
                'fix_suggestion': 'Hãy đọc tiếp phần còn lại của câu.'
            })
            continue

        statuses = chunk['phonemes']
        statuses_eval = chunk.get('phoneme_statuses', [])
        has_specific_error = False
        
        for i, (ph, status) in enumerate(zip(statuses, statuses_eval)):
            if ph == 'cl' and status == 'deletion':
                has_specific_error = True
                errors.append({
                    'word': chunk['text'],
                    'token': 'っ',
                    'type': 'geminate',
                    'severity': 'major',
                    'message': 'Bạn phát âm thiếu âm ngắt っ.',
                    'fix_suggestion': 'Hãy tạo một khoảng ngắt rất ngắn trước âm tiếp theo.'
                })
            
            if i > 0 and ph == statuses[i-1] and ph in ['a', 'e', 'i', 'o', 'u'] and status == 'deletion':
                has_specific_error = True
                errors.append({
                    'word': chunk['text'],
                    'token': 'ー',
                    'type': 'long_vowel',
                    'severity': 'major',
                    'message': 'Bạn chưa kéo dài âm ー đủ rõ.',
                    'fix_suggestion': 'Hãy kéo dài nguyên âm thêm khoảng một nhịp.'
                })
                
            if ph == 'N' and status == 'deletion':
                has_specific_error = True
                errors.append({
                    'word': chunk['text'],
                    'token': 'ん',
                    'type': 'hatsuon',
                    'severity': 'major',
                    'message': 'Âm mũi ん chưa được phát âm rõ.',
                    'fix_suggestion': 'Thử giữ âm mũi lâu hơn trước khi chuyển sang âm tiếp theo.'
                })
                
        if chunk.get('color') in ['red', 'yellow'] and not has_specific_error:
            errors.append({
                'word': chunk['text'],
                'token': chunk.get('kana', chunk['text']),
                'type': 'mispronunciation',
                'severity': 'major' if chunk.get('color') == 'red' else 'minor',
                'message': f"Phát âm từ '{chunk['text']}' chưa chính xác.",
                'fix_suggestion': 'Hãy nghe mẫu và thử phát âm lại từ này rõ ràng hơn.'
            })
                
    return errors
