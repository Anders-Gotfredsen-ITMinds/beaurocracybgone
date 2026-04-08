from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled
import re


class TranscriptError(Exception):
    pass


def _extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise TranscriptError(f"Could not extract a YouTube video ID from URL: {url}")


def fetch_transcript(url: str) -> str:
    video_id = _extract_video_id(url)
    try:
        transcript = YouTubeTranscriptApi().fetch(video_id)
    except NoTranscriptFound:
        raise TranscriptError("No transcript available for this video.")
    except TranscriptsDisabled:
        raise TranscriptError("Transcripts are disabled for this video.")
    return " ".join(s.text for s in transcript)
