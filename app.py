import os
import sys
import logging
import subprocess

# Set up logging to log to the console (Render logs will capture it)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_video_info(url):
    try:
        # Using you-get to fetch video info
        command = f"you-get -d {url}"
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            logger.error(f"Error fetching video info: {stderr.decode('utf-8')}")
            return

        # Parsing output
        video_info = stdout.decode('utf-8')
        logger.info(f"Video Info:\n{video_info}")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")

if __name__ == '__main__':
    video_url = "https://youtu.be/0a83CZ0z2aM?si=8HqI0K_dL5-s7Wlx"
    get_video_info(video_url)
