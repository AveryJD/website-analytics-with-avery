import requests
import schedule
import time
import logging

def ping_endpoints():
    endpoints = ["https://analyticswithavery.com"]
    for url in endpoints:
        try:
            response = requests.get(url, timeout=10)
            logging.info(f"Pinged {url}. Status code: {response.status_code}")
        except Exception as e:
            logging.error(f"Error pinging {url}: {e}")

def main():
    logging.basicConfig(level=logging.INFO)
    schedule.every(10).minutes.do(ping_endpoints)
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
