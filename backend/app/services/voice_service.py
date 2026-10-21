import base64
import math
import struct
from typing import List, Dict, Any
from app.schemas.voice import SpeechSynthesisRequest, SpeechSynthesisResponse

class VoiceService:
    def synthesize_speech(self, req: SpeechSynthesisRequest) -> SpeechSynthesisResponse:
        """
        Generates audio waveform and synchronized viseme cues for Godot character lip animation.
        """
        # Generate valid PCM WAV tone bursts matching syllables
        sample_rate = 16000
        words = req.text.split()
        duration_per_word = 0.35  # seconds
        total_duration = max(1.0, len(words) * duration_per_word)
        total_samples = int(sample_rate * total_duration)

        # Generate simple friendly carrier audio wave
        audio_bytes = bytearray()
        for i in range(total_samples):
            t = float(i) / sample_rate
            # Playful harmonic frequency modulated by word cadence
            freq = 330.0 + 40.0 * math.sin(2.0 * math.pi * 3.0 * t)
            # Syllable amplitude envelope
            env = 0.5 * (1.0 + math.sin(2.0 * math.pi * (1.0 / duration_per_word) * t))
            val = int(32767.0 * 0.4 * env * math.sin(2.0 * math.pi * freq * t))
            audio_bytes.extend(struct.pack("<h", max(-32768, min(32767, val))))

        # Build standard WAV header (44 bytes)
        wav_header = bytearray()
        data_size = len(audio_bytes)
        file_size = data_size + 36

        wav_header.extend(b"RIFF")
        wav_header.extend(struct.pack("<I", file_size))
        wav_header.extend(b"WAVE")
        wav_header.extend(b"fmt ")
        wav_header.extend(struct.pack("<I", 16)) # Subchunk1Size (16 for PCM)
        wav_header.extend(struct.pack("<H", 1))  # AudioFormat (1 = PCM)
        wav_header.extend(struct.pack("<H", 1))  # NumChannels (1 = Mono)
        wav_header.extend(struct.pack("<I", sample_rate))
        wav_header.extend(struct.pack("<I", sample_rate * 2)) # ByteRate
        wav_header.extend(struct.pack("<H", 2))  # BlockAlign
        wav_header.extend(struct.pack("<H", 16)) # BitsPerSample
        wav_header.extend(b"data")
        wav_header.extend(struct.pack("<I", data_size))

        full_wav = bytes(wav_header + audio_bytes)
        encoded_audio = base64.b64encode(full_wav).decode("ascii")

        # Calculate phoneme / viseme cues for Godot lip sync
        cues = []
        cur_time = 0.0
        visemes = ["aa", "ee", "ih", "oh", "ou"]
        for idx, word in enumerate(words):
            cues.append({
                "time": round(cur_time, 2),
                "duration": round(duration_per_word, 2),
                "viseme": visemes[idx % len(visemes)],
                "word": word
            })
            cur_time += duration_per_word

        return SpeechSynthesisResponse(
            audio_base64=encoded_audio,
            format="wav",
            phoneme_cues=cues
        )

voice_service = VoiceService()
