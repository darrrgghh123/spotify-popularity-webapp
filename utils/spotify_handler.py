import os
import time
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

load_dotenv()

client_id = os.getenv("SPOTIPY_CLIENT_ID")
client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")

if not client_id or not client_secret:
    raise ValueError("Spotify credentials not found in .env file")

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=client_id,
    client_secret=client_secret
))

def get_artist_matches(artist_name):
    results = sp.search(q=artist_name, type='artist', limit=15)
    items = results.get("artists", {}).get("items", [])
    return {
        "results": [
            {
                "id": a["id"],
                "name": a["name"],
                "image": a["images"][0]["url"] if a["images"] else None
            }
            for a in items
        ]
    }


def get_albums_and_tracks(artist_id, release_types="album"):
    albums_raw = []
    seen_album_ids = set()
    offset = 0

    while True:
        res = sp.artist_albums(artist_id, album_type=release_types, limit=50, offset=offset)
        items = res.get("items", [])
        if not items:
            break

        for album in items:
            if album["id"] in seen_album_ids:
                continue
            seen_album_ids.add(album["id"])
            try:
                details = sp.album(album["id"])
                popularity = details.get("popularity", 0)
                release_date = details.get("release_date", "????")
                release_year = release_date.split("-")[0] if release_date != "????" else "Unknown"
                album_type = album.get("album_type", "album")

                tracks_res = sp.album_tracks(album["id"])
                track_items = tracks_res.get("items", [])
                track_ids = [tr["id"] for tr in track_items]

                full_tracks = []
                for i in range(0, len(track_ids), 50):
                    chunk = track_ids[i:i+50]
                    try:
                        response = sp.tracks(chunk)
                        full_tracks.extend(response.get("tracks", []))
                        time.sleep(0.1)
                    except:
                        continue

                tracks = []
                for tr in full_tracks:
                    if tr:
                        tracks.append({
                            "id": tr["id"],
                            "name": tr["name"],
                            "popularity": tr.get("popularity", 0)
                        })

                albums_raw.append({
                    "id": album["id"],
                    "name": album["name"],
                    "popularity": popularity,
                    "release_year": release_year,
                    "release_date": release_date,
                    "tracks": tracks,
                    "album_type": album_type
                })

                time.sleep(0.2)
            except Exception as e:
                continue

        offset += 50
        if len(items) < 50:
            break

    artist_info = sp.artist(artist_id)
    return {"albums": albums_raw, "artist": artist_info}
