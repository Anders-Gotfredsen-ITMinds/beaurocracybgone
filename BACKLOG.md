# Backlog

## Fact-checker
- [ ] Refine fact-check prompt — improve claim extraction quality and verdict accuracy
- [x] Support non-YouTube URLs (Instagram, TikTok, etc.) via yt-dlp + Whisper fallback
- [ ] Handle very long transcripts — chunk and merge results to stay within token limits
- [ ] Add confidence score per claim

## Analyze
- [ ] Add `tldr` mode — single-sentence summary

## Research / Data
- [ ] Build a scraper to discover and collect videos by topic/category (e.g. health advice, finance tips, news) — feed them through the fact-checker in bulk to analyse how accurate information tends to be across different content types

## General
- [ ] Rate limiting
- [ ] Streaming responses for long LLM calls
