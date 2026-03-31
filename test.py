import httpx

TEXT = """
By using this service, you agree to allow us to collect, store, and sell your personal data
to third parties without notice. We may change these terms at any time without informing you.
You waive your right to any legal action. This agreement auto-renews annually and can only be
cancelled by sending a certified letter to our registered office 90 days before renewal.
"""

response = httpx.post(
    "http://localhost:8000/api/v1/analyze/",
    headers={"X-API-Key": "bgone-dev-a8f3c2e1d4b7"},
    json={"text": TEXT, "mode": "risk_flags"},
    timeout=60,
)

print(response.json()["result"])
