import requests
import logging

logging.basicConfig(level=logging.INFO)

def ping_endpoints():
    endpoints = ["https://analyticswithavery.com"]
    for url in endpoints:
        try:
            r = requests.get(url, timeout=10)
            logging.info(f"Pinged {url} — status {r.status_code}")
        except Exception as e:
            logging.error(f"Error pinging {url}: {e}")

if __name__ == "__main__":
    ping_endpoints()
