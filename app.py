# app.py

from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

# API endpoint to fetch video info
@app.route('/video', methods=['GET'])
def get_video_info():
    video_url = request.args.get('url')  # URL passed as query parameter

    if not video_url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        # Initialize yt-dlp options
        ydl_opts = {
            'quiet': True,
            'forcejson': True
        }

        # Fetch video information
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            video_info = ydl.extract_info(video_url, download=False)

        # Extract the relevant data
        response = {
            'title': video_info.get('title'),
            'description': video_info.get('description'),
            'thumbnail': video_info.get('thumbnail'),
            'formats': video_info.get('formats'),
            'url': video_info.get('url'),
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
