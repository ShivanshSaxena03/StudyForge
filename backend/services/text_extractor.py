import os
from typing import Optional


async def extract_text(file_path: str, content_type: str) -> Optional[str]:
    try:
        if content_type == "pdf":
            return extract_pdf(file_path)
        elif content_type == "docx":
            return extract_docx(file_path)
        elif content_type == "audio":
            return extract_audio(file_path)
    except Exception as e:
        print(f"Text extraction error ({content_type}): {e}")
        return None
    return None


def extract_pdf(file_path: str) -> str:
    import fitz  # PyMuPDF
    doc = fitz.open(file_path)
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n".join(text_parts)


def extract_docx(file_path: str) -> str:
    from docx import Document
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_audio(file_path: str) -> str:
    """Transcribe audio using SpeechRecognition with Google Web API (free)."""
    import speech_recognition as sr
    from pydub import AudioSegment
    import tempfile

    # Convert to wav if needed
    ext = os.path.splitext(file_path)[1].lower()
    wav_path = file_path

    if ext != ".wav":
        audio = AudioSegment.from_file(file_path)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wav_path = tmp.name
        audio.export(wav_path, format="wav")

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return "[Audio content could not be transcribed clearly]"
    except sr.RequestError:
        return "[Speech recognition service unavailable - please add text manually]"
    finally:
        if wav_path != file_path and os.path.exists(wav_path):
            os.remove(wav_path)
