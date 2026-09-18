from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from asr.wav2vec2 import ASRService
from normalization.g2p import normalize_and_get_phonemes
from scoring.engine import evaluate_pronunciation
from audio.validation import AudioValidator, AudioValidationException
from database import engine, Base, get_db
from models import HistoryItem
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from fastapi import Depends
import datetime
import edge_tts
from fastapi.responses import StreamingResponse
import io


app = FastAPI(title="Japanese Pronunciation Scoring API v2.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    speed: float = 1.0
    voice: str = "ja-JP-NanamiNeural"

class Chunk(BaseModel):
    text: str
    timestamp: tuple[float, float]

class ScoreDetail(BaseModel):
    phoneme: float
    completeness: float
    fluency: float
    overall: float

class ErrorFeedback(BaseModel):
    word: str
    token: str
    type: str
    severity: str
    message: str
    fix_suggestion: str

class AlignedChunk(BaseModel):
    text: str
    kana: str
    phonemes: List[str]
    index: int
    phoneme_statuses: List[str]
    insertions: int
    color: str

class AnalyzeRequest(BaseModel):
    text: str

class ScoreResponse(BaseModel):
    status: str = "success"
    error_type: Optional[str] = None
    message: Optional[str] = None
    score: Optional[float] = None
    scores: Optional[ScoreDetail] = None
    alignment: Optional[List[AlignedChunk]] = None
    errors: Optional[List[ErrorFeedback]] = None
    feedback: Optional[List[str]] = None
    transcription: Optional[str] = None
    phonemes: Optional[str] = None
    expected_phonemes: Optional[str] = None
    kana_chunks: Optional[List[Chunk]] = None
    phoneme_chunks: Optional[List[Chunk]] = None

asr_service = ASRService()
audio_validator = AudioValidator(max_duration=60.0, min_duration=0.1, max_size_mb=50.0, rms_threshold=0.0001)

@app.get("/")
def read_root():
    return {"message": "AI Service is running (v2.2)"}

@app.post("/analyze-text")
async def analyze_text(request: AnalyzeRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    if len(text) > 150:
        raise HTTPException(status_code=400, detail="Text is too long (max 150 characters)")
        
    from normalization.g2p import get_expected_chunks
    try:
        chunks = get_expected_chunks(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not analyze Japanese text")
        return {"status": "success", "text": text, "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    
    # 1. Audio Validation
    try:
        audio_data = audio_validator.validate_and_decode(audio_bytes)
    except AudioValidationException as e:
        return {"status": "error", "error_type": "audio_invalid", "message": e.message}
        
    # 2. ASR Processing
    asr_result = asr_service.process_audio(audio_data)
    
    # 3. Handle ASR Unrecognized
    if asr_result.get("status") == "error":
        return {"status": "error", "error_type": asr_result.get("error_type", "asr_unrecognized"), "message": asr_result.get("message", "Khng nh?n di?n du?c gi?ng ni.")}
        
    transcription = asr_result.get("transcription", "").strip()
    if not transcription:
        return {"status": "error", "error_type": "asr_unrecognized", "message": "Khng nh?n di?n du?c gi?ng ni."}
        
    return {
        "status": "success",
        "transcription": transcription
    }

@app.post("/score", response_model=ScoreResponse)
async def score_pronunciation(audio: UploadFile = File(...), expected_text: str = Form("")):
    audio_bytes = await audio.read()
    if not expected_text.strip():
        return {"status": "error", "error_type": "text_invalid", "message": "Expected text cannot be empty."}
    if len(expected_text) > 150:
        return {"status": "error", "error_type": "text_invalid", "message": "Expected text is too long (max 150 characters)."}

    # 1. Audio Validation
    try:
        audio_data = audio_validator.validate_and_decode(audio_bytes)
    except AudioValidationException as e:
        return {"status": "error", "error_type": "audio_invalid", "message": e.message}
        
    # 2. ASR Processing
    asr_result = asr_service.process_audio(audio_data)
    
    # Check if ASR failed to recognize anything (asr_unrecognized)
    if asr_result.get("status") == "error":
        return asr_result

    # 3. Pronunciation Evaluation
    evaluation = evaluate_pronunciation(
        expected_text=expected_text,
        actual_phonemes_str=asr_result["phonemes"],
        actual_phoneme_chunks=asr_result["phoneme_chunks"],
        audio_duration=asr_result["audio_duration"]
    )
    
    # 4. Partial Reading & Content Mismatch Check
    alignment = evaluation["alignment"]
    total_alignment_phonemes = sum(len(c["phonemes"]) for c in alignment) if alignment else 1
    total_errors = sum(1 for c in alignment for s in c["phoneme_statuses"] if s in ["substitution", "deletion", "insertion"])
    similarity = max(0.0, 1.0 - (total_errors / max(total_alignment_phonemes, 1)))
    
    # Get all statuses to check for contiguous matching region
    statuses = []
    for c in alignment:
        statuses.extend(c["phoneme_statuses"])
        
    first_match = -1
    last_match = -1
    for i, s in enumerate(statuses):
        if s != "deletion":
            if first_match == -1:
                first_match = i
            last_match = i
            
    is_partial_reading = False
    if first_match != -1 and last_match != -1:
        region_len = last_match - first_match + 1
        region_errors = sum(1 for s in statuses[first_match:last_match+1] if s != "match")
        region_similarity = max(0.0, 1.0 - (region_errors / max(region_len, 1)))
        
        # If the user read a contiguous chunk reasonably well
        if region_similarity > 0.60 and region_len >= 3:
            is_partial_reading = True
            
    # If it's NOT a partial reading AND similarity is very low, it's a mismatch
    if not is_partial_reading and similarity < 0.25:
        return {
            "status": "error", 
            "error_type": "possible_content_mismatch", 
            "message": "Nội dung bài đọc có vẻ không khớp với câu yêu cầu.",
            "transcription": asr_result["transcription"],
            "asr_text": asr_result["transcription"]
        }
        
    return {
        "status": "success",
        "score": evaluation["scores"]["overall"],
        "scores": evaluation["scores"],
        "alignment": evaluation["alignment"],
        "errors": evaluation["errors"],
        "feedback": evaluation["feedback"],
        "transcription": asr_result["transcription"],
        "asr_text": asr_result["transcription"],
        "phonemes": asr_result["phonemes"],
        "expected_phonemes": normalize_and_get_phonemes(expected_text),
        "kana_chunks": asr_result["kana_chunks"],
        "phoneme_chunks": asr_result["phoneme_chunks"]
    }


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HistoryItem).order_by(HistoryItem.id.desc()))
    items = result.scalars().all()
    # Ensure IDs are strings since frontend expects strings
    return [{
        "id": str(i.id),
        "date": i.date,
        "score": i.score,
        "phoneme": i.phoneme,
        "completeness": i.completeness,
        "fluency": i.fluency,
        "source": i.source
    } for i in items]

@app.post("/history")
async def create_history(item: dict, db: AsyncSession = Depends(get_db)):
    new_item = HistoryItem(
        date=datetime.datetime.now().strftime('%H:%M:%S %d/%m/%Y'),
        score=item.get("score"),
        phoneme=item.get("phoneme"),
        completeness=item.get("completeness"),
        fluency=item.get("fluency"),
        source=item.get("source")
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return {
        "id": str(new_item.id),
        "date": new_item.date,
        "score": new_item.score,
        "phoneme": new_item.phoneme,
        "completeness": new_item.completeness,
        "fluency": new_item.fluency,
        "source": new_item.source
    }

@app.delete("/history")
async def clear_history(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(HistoryItem))
    await db.commit()
    return {"status": "success"}

@app.delete("/history/{item_id}")
async def delete_history_item(item_id: str, db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(delete(HistoryItem).where(HistoryItem.id == int(item_id)))
        await db.commit()
    except Exception:
        pass
    return {"status": "success"}

@app.post("/tts")
async def generate_tts(req: TTSRequest):
    rate_percent = int((req.speed - 1.0) * 100)
    rate_str = f"+{rate_percent}%" if rate_percent >= 0 else f"{rate_percent}%"
    
    communicate = edge_tts.Communicate(req.text, voice=req.voice, rate=rate_str)
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
            
    return StreamingResponse(io.BytesIO(audio_data), media_type="audio/mpeg")
