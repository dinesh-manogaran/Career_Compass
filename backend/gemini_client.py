# backend/gemini_client.py
import os
from dotenv import load_dotenv
from google import genai  # from google-genai package

# Load environment variables from .env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

# Create Gemini client
client = genai.Client(api_key=API_KEY)

# Choose model (fast & good for this use-case)
GEMINI_MODEL = "gemini-2.5-flash"
