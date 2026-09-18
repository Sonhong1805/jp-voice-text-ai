import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scoring.engine import evaluate_pronunciation
res = evaluate_pronunciation("こんにちは", "k o N", [], 2.0)
print(res["errors"])
