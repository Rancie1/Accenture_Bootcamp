---
inclusion: auto
---

# Python Virtual Environment Guidelines

## Critical Rule: Always Use Virtual Environment

When running Python commands in the `Backend/` directory, you MUST use the virtual environment Python interpreter.

### Required Command Format

**ALWAYS use:**

```bash
./venv/bin/python -m pytest
./venv/bin/python -m pip install <package>
./venv/bin/python script.py
```

**NEVER use:**

```bash
python -m pytest          # ❌ Uses system Python
python3 -m pytest         # ❌ Uses system Python
pytest                    # ❌ Uses system Python
```

### Why This Matters

- System Python (`/usr/bin/python3`) does not have project dependencies installed
- Virtual environment (`Backend/venv/`) has all packages from `requirements.txt`
- Using system Python will result in "No module named pytest" and similar errors

### Testing Commands

When running tests in the Backend directory:

```bash
# Run all tests
./venv/bin/python -m pytest -v

# Run specific test file
./venv/bin/python -m pytest test_file.py -v

# Run with coverage
./venv/bin/python -m pytest --cov=. -v
```

### Installing Dependencies

```bash
./venv/bin/python -m pip install -r requirements.txt
```

### Running the Application

```bash
./venv/bin/python -m uvicorn main:app --reload
```

## Enforcement

This rule applies to ALL Python commands executed in the Backend directory. No exceptions.
