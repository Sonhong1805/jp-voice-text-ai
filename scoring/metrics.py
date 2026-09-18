def list_edit_distance(expected: list[str], actual: list[str]):
    """
    Computes Levenshtein distance between two lists of strings.
    Returns (distance, num_deletions_from_expected)
    """
    m, n = len(expected), len(actual)
    # dp[i][j] stores (distance, num_deletions)
    dp = [[(0, 0)] * (n + 1) for _ in range(m + 1)]
    
    for i in range(m + 1):
        dp[i][0] = (i, i) # i deletions
    for j in range(n + 1):
        dp[0][j] = (j, 0) # j insertions (0 deletions from expected)
        
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if expected[i - 1] == actual[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                # substitution
                sub_dist, sub_del = dp[i - 1][j - 1]
                # deletion from expected
                del_dist, del_del = dp[i - 1][j]
                # insertion into expected (i.e. actual has extra)
                ins_dist, ins_del = dp[i][j - 1]
                
                # find minimum distance
                min_dist = min(sub_dist, del_dist, ins_dist) + 1
                
                # prefer the path with the minimum distance. If ties, we just take one.
                # substitution means expected[i-1] was replaced, so it wasn't pronounced correctly.
                # Does a substitution count as "aligned" or "deleted" for completeness? 
                # The user's definition of Completeness: "phoneme đã đọc đúng / align được".
                # If they said 'sh' instead of 'ch', they attempted it (substitution), so it's NOT a deletion.
                # A deletion is when they skipped the phoneme entirely (e.g. read half a sentence).
                if min_dist == sub_dist + 1:
                    dp[i][j] = (min_dist, sub_del)
                elif min_dist == del_dist + 1:
                    dp[i][j] = (min_dist, del_del + 1)
                else:
                    dp[i][j] = (min_dist, ins_del)
                    
    return dp[m][n]

def calculate_phoneme_accuracy(expected_phonemes: list[str], actual_phonemes: list[str]) -> float:
    if not expected_phonemes and not actual_phonemes:
        return 100.0
    if not expected_phonemes or not actual_phonemes:
        return 0.0
        
    dist, _ = list_edit_distance(expected_phonemes, actual_phonemes)
    max_len = max(len(expected_phonemes), len(actual_phonemes))
    
    accuracy = 100.0 * (1.0 - (dist / max_len))
    return max(0.0, min(100.0, accuracy))

def calculate_completeness(expected_phonemes: list[str], actual_phonemes: list[str]) -> float:
    if not expected_phonemes:
        return 100.0
    if not actual_phonemes:
        return 0.0
        
    _, num_deletions = list_edit_distance(expected_phonemes, actual_phonemes)
    
    aligned_expected = len(expected_phonemes) - num_deletions
    completeness = 100.0 * (aligned_expected / len(expected_phonemes))
    return max(0.0, min(100.0, completeness))
