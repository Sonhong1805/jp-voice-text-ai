import sys
import os

# Add parent dir to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scoring.engine import evaluate_pronunciation

def test_unit():
    tests = [
        # Expected text, actual phonemes, result constraints
        ("がっこう", "g a k o o", "geminate"), # Missing cl
        ("スーパー", "s u p a", "long_vowel"), # Missing long vowel
        ("せんせい", "s e s e i", "hatsuon"), # Missing N
        ("こんにちは", "k o N n i ch i w a", "success"), # Perfect
        ("こんにちは", "k o N", "partial") # Partial reading -> missing error, no mismatch
    ]
    
    for i, (expected, actual, constraint) in enumerate(tests):
        res = evaluate_pronunciation(expected, actual, [], 2.0)
        errors = res.get("errors", [])
        
        print(f"\n--- Testing Case {i+1} ---")
        print(f"Actual: {actual}")
        print(f"Overall Score: {res['scores']['overall']}")
        
        if constraint == "success":
            assert len(errors) == 0, f"Expected no errors, got {len(errors)}"
            print("PASS: Success case")
        elif constraint == "partial":
            assert res['scores']['completeness'] < 50, "Expected low completeness"
            print("PASS: Partial reading completeness low")
        else:
            # We expect a specific phoneme error
            specific_error = next((e for e in errors if e['type'] == constraint), None)
            assert specific_error is not None, f"Expected {constraint} error"
            print(f"PASS: Found expected error '{constraint}'")

if __name__ == "__main__":
    test_unit()
