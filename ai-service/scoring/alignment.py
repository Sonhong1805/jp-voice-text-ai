from typing import List, Dict, Any, Tuple
import Levenshtein

def align_phonemes(expected_chunks: List[Dict[str, Any]], actual_phonemes: List[str]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Aligns actual phonemes with expected chunks.
    Returns:
      - updated_chunks: expected_chunks enriched with alignment status and color.
      - alignments: Flat list of all operations for raw rendering if needed.
    """
    # Flatten expected phonemes and keep track of which chunk they belong to
    flat_expected = []
    chunk_map = []  # index in flat_expected -> index in expected_chunks
    
    for i, chunk in enumerate(expected_chunks):
        for ph in chunk["phonemes"]:
            flat_expected.append(ph)
            chunk_map.append(i)
            
    # Run Levenshtein alignment
    editops = Levenshtein.editops(flat_expected, actual_phonemes)
    
    # By default, everything is a match
    status_map = {i: "match" for i in range(len(flat_expected))}
    
    insertions = []
    
    for op, i_exp, i_act in editops:
        if op == "replace":
            status_map[i_exp] = "substitution"
        elif op == "delete":
            status_map[i_exp] = "deletion"
        elif op == "insert":
            insertions.append(i_exp)
            
    # Map back to chunks
    updated_chunks = []
    
    for i, chunk in enumerate(expected_chunks):
        chunk_copy = chunk.copy()
        
        # Gather statuses for phonemes in this chunk
        chunk_statuses = []
        for idx in range(len(flat_expected)):
            if chunk_map[idx] == i:
                chunk_statuses.append(status_map[idx])
                
        chunk_insertions = 0
        for ins in insertions:
            if ins < len(chunk_map) and chunk_map[ins] == i:
                chunk_insertions += 1
            elif ins == len(chunk_map) and i == len(expected_chunks) - 1:
                chunk_insertions += 1
                
        chunk_copy["phoneme_statuses"] = chunk_statuses
        chunk_copy["insertions"] = chunk_insertions
        
        has_sub = "substitution" in chunk_statuses
        has_del = "deletion" in chunk_statuses
        has_ins = chunk_insertions > 0
        
        if not has_sub and not has_del and not has_ins:
            color = "green"
        elif has_del or has_ins:
            if all(s == "deletion" for s in chunk_statuses):
                color = "gray"
            else:
                color = "red"
        elif has_sub:
            color = "yellow"
        else:
            color = "green"
            
        chunk_copy["color"] = color
        updated_chunks.append(chunk_copy)
        
    return updated_chunks, editops
