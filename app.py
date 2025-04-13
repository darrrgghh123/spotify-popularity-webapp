from flask import Flask, render_template, request, jsonify
from utils.spotify_handler import get_artist_matches, get_albums_and_tracks

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/search_artist", methods=["POST"])
def search_artist():
    data = request.json
    artist_name = data.get("artist")
    if not artist_name:
        return jsonify({"error": "No artist name provided"}), 400

    results = get_artist_matches(artist_name)
    return jsonify(results)

@app.route("/get_discography", methods=["POST"])
def get_discography():
    data = request.get_json()
    artist_id = data.get("artist_id")
    # По умолчанию загружаем только "album"
    release_types = data.get("release_types", "album")
    albums_data = get_albums_and_tracks(artist_id, release_types=release_types)
    return jsonify(albums_data)


if __name__ == "__main__":
    app.run(debug=True)