import tempfile
import av
import numpy as np

class AudioValidationException(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class AudioValidator:
    def __init__(self, max_duration=60.0, min_duration=0.1, max_size_mb=50.0, rms_threshold=0.0001):
        self.max_duration = max_duration
        self.min_duration = min_duration
        self.max_size_mb = max_size_mb
        self.rms_threshold = rms_threshold
        
    def validate_and_decode(self, audio_bytes: bytes) -> np.ndarray:
        # 1. Size Validation
        size_mb = len(audio_bytes) / (1024 * 1024)
        if size_mb > self.max_size_mb:
            raise AudioValidationException(f"File quá lớn (tối đa {self.max_size_mb}MB).")
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
            
        try:
            container = av.open(tmp_path)
            audio_stream = next(s for s in container.streams if s.type == 'audio')
            resampler = av.AudioResampler(format='flt', layout='mono', rate=16000)
            
            frames = []
            for frame in container.decode(audio_stream):
                frame.pts = None
                for rf in resampler.resample(frame):
                    frames.append(rf.to_ndarray()[0])
            for rf in resampler.resample(None):
                frames.append(rf.to_ndarray()[0])
                
            container.close()
            audio_data = np.concatenate(frames) if frames else np.array([], dtype=np.float32)
            
            # 2. Duration Validation
            duration = len(audio_data) / 16000.0
            if duration < self.min_duration:
                raise AudioValidationException("Âm thanh quá ngắn.")
            if duration > self.max_duration:
                raise AudioValidationException(f"Âm thanh quá dài (tối đa {self.max_duration} giây).")
                
            # 3. RMS/Energy Check (Heuristic Silence Gate)
            rms = float(np.sqrt(np.mean(audio_data**2)))
            if rms < self.rms_threshold:
                raise AudioValidationException("Âm thanh quá nhỏ hoặc im lặng hoàn toàn.")
                
            return audio_data
            
        except av.AVError:
            raise AudioValidationException("Không thể giải mã file âm thanh. File có thể bị lỗi.")
        except Exception as e:
            if isinstance(e, AudioValidationException):
                raise e
            raise AudioValidationException(f"Lỗi khi xử lý âm thanh: {str(e)}")
