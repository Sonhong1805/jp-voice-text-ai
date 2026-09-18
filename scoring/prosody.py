import numpy as np
import librosa

def extract_normalized_energy_contour(y: np.ndarray, sr: int = 16000) -> np.ndarray:
    """
    Trích xuất RMS Energy Contour đã chuẩn hoá của một đoạn âm thanh.
    1. VAD: Cắt bỏ khoảng lặng ở hai đầu.
    2. RMS: Lấy biểu đồ năng lượng.
    3. Normalize: Đưa về thang [0, 1].
    """
    if len(y) == 0:
        return np.array([])
        
    # 1. VAD (Voice Activity Detection): Trim silence (30dB below reference)
    y_trimmed, _ = librosa.effects.trim(y, top_db=30)
    
    if len(y_trimmed) == 0:
        return np.array([])
        
    # 2. Extract RMS Energy (frame_length=2048, hop_length=512 default)
    rms = librosa.feature.rms(y=y_trimmed)[0]
    
    # 3. Min-Max Normalization -> [0, 1]
    rms_min = np.min(rms)
    rms_max = np.max(rms)
    
    if rms_max == rms_min:
        # Nếu đoạn âm thanh có năng lượng không đổi tuyệt đối
        return np.zeros_like(rms)
        
    normalized_rms = (rms - rms_min) / (rms_max - rms_min)
    return normalized_rms

def calculate_prosody_score(ref_audio: np.ndarray, user_audio: np.ndarray, sr: int = 16000) -> float:
    """
    Dùng DTW để so sánh Energy Contour của người dùng với mẫu chuẩn.
    Trả về điểm số Prosody (0 - 100).
    """
    if ref_audio is None or user_audio is None or len(ref_audio) == 0 or len(user_audio) == 0:
        return 100.0 # Bỏ qua nếu thiếu dữ liệu
        
    # Lấy đường cong năng lượng
    ref_contour = extract_normalized_energy_contour(ref_audio, sr)
    user_contour = extract_normalized_energy_contour(user_audio, sr)
    
    if len(ref_contour) == 0 or len(user_contour) == 0:
        return 0.0
        
    # DTW alignment (Dynamic Time Warping)
    # librosa.sequence.dtw returns D (cost matrix), wp (warping path)
    D, wp = librosa.sequence.dtw(X=ref_contour, Y=user_contour, metric='euclidean')
    
    # D[-1, -1] là tổng chi phí đường đi (alignment cost)
    total_cost = D[-1, -1]
    
    # wp là mảng chứa tọa độ đường đi [(x_N, y_M), ..., (x_0, y_0)]
    path_length = len(wp)
    
    if path_length == 0:
        return 0.0
        
    # Normalized cost = chi phí trung bình trên mỗi bước chạy (tối đa là 1.0 vì đã normalize contour về [0, 1])
    normalized_cost = total_cost / path_length
    
    # Đổi chi phí thành điểm tương đồng (Càng nhỏ càng giống -> điểm càng cao)
    # Vì cost tối đa là 1, ta nhân 100 cho hệ hệ 100.
    similarity = max(0.0, 100.0 * (1.0 - normalized_cost))
    
    return similarity
