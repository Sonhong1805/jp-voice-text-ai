from sqlalchemy import Column, Integer, String, Float
from database import Base

class HistoryItem(Base):
    __tablename__ = "history_items"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    score = Column(Float)
    phoneme = Column(Float)
    completeness = Column(Float)
    fluency = Column(Float)
    source = Column(String)
