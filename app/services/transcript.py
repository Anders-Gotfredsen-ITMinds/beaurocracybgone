import os
import re
import tempfile

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled

_whisper_model = None


class TranscriptError(Exception):
    pass


def _is_youtube(url: str) -> bool:
    return bool(re.search(r"(?:youtube\.com|youtu\.be)", url))


def _fetch_youtube_transcript(url: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})", url)
    if not match:
        raise TranscriptError(f"Could not extract a YouTube video ID from URL: {url}")
    video_id = match.group(1)
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
    except NoTranscriptFound:
        raise TranscriptError("No transcript available for this video.")
    except TranscriptsDisabled:
        raise TranscriptError("Transcripts are disabled for this video.")
    return " ".join(s.text for s in transcript)


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return _whisper_model


def _fetch_whisper_transcript(url: str) -> str:
    import yt_dlp

    with tempfile.TemporaryDirectory() as tmpdir:
        audio_path = os.path.join(tmpdir, "audio")
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": audio_path,
            "postprocessors": [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3"}],
            "quiet": True,
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
        except Exception as e:
            raise TranscriptError(f"Could not download video: {e}")

        audio_file = audio_path + ".mp3"
        if not os.path.exists(audio_file):
            raise TranscriptError("Audio extraction failed — ffmpeg may not be installed.")

        model = _get_whisper_model()
        segments, _ = model.transcribe(audio_file)
        return " ".join(segment.text for segment in segments)


def fetch_transcript(url: str) -> str:
    if _is_youtube(url):
        return _fetch_youtube_transcript(url)
    return _fetch_whisper_transcript(url)
