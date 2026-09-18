import os
import sys
import numpy as np
import torch
from transformers import Wav2Vec2FeatureExtractor

from asr.kana_vocab import KanaVocab
from asr.phoneme_vocab import PhonemeVocab
from asr.model import load_checkpoint

class ASRService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
        self.checkpoint_path = os.path.join(os.path.dirname(__file__), "..", "models", "checkpoints", "best-medium-ep5-inference.pt")
        self.model = None
        
        self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("reazon-research/japanese-wav2vec2-large")
        self.kana_vocab = KanaVocab()
        self.phoneme_vocab = PhonemeVocab()

    def load_model(self):
        if self.model is None:
            print(f"Loading Dual CTC Model from {self.checkpoint_path}...")
            self.model = load_checkpoint(self.checkpoint_path, pretrained="reazon-research/japanese-wav2vec2-large", inter_ctc_layer=12)
            self.model.to(self.device)
            self.model.eval()

    def unload_model(self):
        if self.model is not None:
            print("Unloading Dual CTC Model from VRAM...")
            del self.model
            self.model = None
            import gc
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            elif torch.backends.mps.is_available():
                torch.mps.empty_cache()

    def extract_timestamps(self, pred_ids: list[int], vocab, frame_duration=0.02):
        chunks = []
        current_token_id = None
        start_frame = None
        
        for i, token_id in enumerate(pred_ids):
            if token_id != current_token_id:
                if current_token_id is not None and current_token_id != vocab.stoi["<blank>"]:
                    token = vocab.itos.get(current_token_id)
                    if token:
                        chunks.append({
                            "text": token,
                            "timestamp": (round(start_frame * frame_duration, 3), round(i * frame_duration, 3))
                        })
                current_token_id = token_id
                start_frame = i
                
        if current_token_id is not None and current_token_id != vocab.stoi["<blank>"]:
            token = vocab.itos.get(current_token_id)
            if token:
                chunks.append({
                    "text": token,
                    "timestamp": (round(start_frame * frame_duration, 3), round(len(pred_ids) * frame_duration, 3))
                })
            
        return chunks

    def process_audio(self, audio_data: np.ndarray):
        audio_duration = len(audio_data) / 16000.0
        
        try:
            self.load_model()
            
            # Pad audio with 0.5s of silence at start and end to prevent ASR from dropping initial/final phonemes
            padding = np.zeros(int(0.5 * 16000), dtype=np.float32)
            padded_audio = np.concatenate([padding, audio_data, padding])
            
            # Extract features
            inputs = self.feature_extractor(
                padded_audio,
                sampling_rate=16000,
                return_tensors="pt",
                return_attention_mask=True,
            )
            input_values = inputs.input_values.to(self.device)
            attention_mask = inputs.attention_mask.to(self.device)
            
            with torch.no_grad():
                outputs = self.model(input_values, attention_mask=attention_mask)
                kana_logits = outputs["kana_logits"]
                phoneme_logits = outputs["phoneme_logits"]
            
                kana_pred_ids = kana_logits.squeeze(0).argmax(dim=-1).tolist()
                phoneme_pred_ids = phoneme_logits.squeeze(0).argmax(dim=-1).tolist()
            
            transcription = self.kana_vocab.decode(kana_pred_ids).strip()
            phonemes = self.phoneme_vocab.decode(phoneme_pred_ids).strip()
            
            # Remove multiple spaces if any
            phonemes = " ".join(phonemes.split())
            
            if len(phonemes) == 0:
                return {"status": "error", "error_type": "asr_unrecognized", "message": "Không nhận diện được nội dung giọng nói."}
            
            kana_chunks = self.extract_timestamps(kana_pred_ids, self.kana_vocab)
            phoneme_chunks = self.extract_timestamps(phoneme_pred_ids, self.phoneme_vocab)
            
            return {
                "status": "success",
                "transcription": transcription,
                "phonemes": phonemes,
                "kana_chunks": kana_chunks,
                "phoneme_chunks": phoneme_chunks,
                "audio_duration": audio_duration
            }
            
        finally:
            self.unload_model()
