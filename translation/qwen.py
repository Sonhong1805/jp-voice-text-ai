import torch
import gc
from typing import Optional, Any
from transformers import AutoTokenizer, AutoModelForCausalLM

class TranslationService:
    def __init__(self):
        self.model_name = "Qwen/Qwen2.5-1.5B-Instruct"
        
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")
            
        self.tokenizer: Optional[Any] = None
        self.model: Optional[Any] = None

    def load_model(self):
        if self.tokenizer is None:
            print(f"Loading tokenizer for {self.model_name}...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        if self.model is None:
            print(f"Loading {self.model_name} model onto {self.device}...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype="auto",
                device_map="auto" if self.device.type == "cuda" else None
            )
            if self.device.type != "cuda":
                self.model = self.model.to(self.device)
            self.model.eval()

    def unload_model(self):
        if self.model is not None:
            print(f"Unloading {self.model_name} model from {self.device}...")
            del self.model
            self.model = None
            gc.collect()
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                torch.mps.empty_cache()

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        try:
            self.load_model()
            
            if self.tokenizer is None or self.model is None:
                raise RuntimeError("Failed to load model or tokenizer")
                
            lang_map = {
                "Tiếng Việt": "Vietnamese",
                "Tiếng Nhật": "Japanese",
                "Tiếng Anh": "English",
                "Tiếng Trung (Giản thể)": "Chinese",
                "Tiếng Hàn": "Korean",
                "Tiếng Pháp": "French",
                "Tiếng Tây Ban Nha": "Spanish",
                "Tiếng Đức": "German",
                "Tiếng Nga": "Russian",
                "Tiếng Thái": "Thai"
            }
            src = lang_map.get(source_lang, source_lang)
            tgt = lang_map.get(target_lang, target_lang)
            
            if src in ["Phát hiện ngôn ngữ", "Auto Detect"]:
                prompt = f"Translate the following text to natural {tgt}:\n\nText: {text}\n\nTranslation:"
            else:
                prompt = f"Translate the following {src} text to natural {tgt}:\n\nText: {text}\n\nTranslation:"
            
            messages = [
                {"role": "system", "content": "You are a professional translator. Translate the given text accurately and naturally, preserving the original tone. Output ONLY the translation without any quotes or explanations."},
                {"role": "user", "content": prompt}
            ]
            
            text_input = self.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            model_inputs = self.tokenizer([text_input], return_tensors="pt").to(self.device)

            with torch.no_grad():
                generated_ids = self.model.generate(
                    **model_inputs,
                    max_new_tokens=100,
                    temperature=0.3,
                    do_sample=True
                )
                
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]

            result = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
            return result
        finally:
            self.unload_model()
