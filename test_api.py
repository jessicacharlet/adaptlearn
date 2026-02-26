import requests

url = "http://127.0.0.1:5000/predict"

data = {
    "typing_speed_wpm": 45,
    "keystroke_delay": 0.25,
    "error_rate": 0.05,

    "page_transitions": 10,
    "backtrack_count": 3,
    "scroll_depth": 0.8,

    "avg_sentence_length": 12,
    "response_time_sec": 30,
    "vocab_richness": 0.6,

    "video_watch_ratio": 0.7,
    "audio_play_ratio": 0.3,
    "image_click_ratio": 0.6
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.json())
