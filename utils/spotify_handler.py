import os
import time
import re
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import unicodedata


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
    variants = _query_variants(artist_name)
    seen_ids = set()
    collected = []

    for v in variants:
        # две страницы по 50, чтобы получить до 100 результатов
        for offset in (0, 50):
            try:
                res = sp.search(q=v, type='artist', limit=50, offset=offset)
            except Exception:
                continue
            items = res.get("artists", {}).get("items", []) or []
            for a in items:
                aid = a.get("id")
                if not aid or aid in seen_ids:
                    continue
                seen_ids.add(aid)
                # возьмём самую маленькую картинку (последнюю)
                img_url = None
                if a.get("images"):
                    img_url = a["images"][-1].get("url") or a["images"][0].get("url")
                collected.append({
                    "id": aid,
                    "name": a.get("name", ""),
                    "image": img_url
                })

    # если совсем пусто — вернём то, что было бы по исходному запросу
    if not collected:
        res = sp.search(q=artist_name, type='artist', limit=15)
        items = res.get("artists", {}).get("items", []) or []
        for a in items:
            img_url = a["images"][-1]["url"] if a.get("images") else None
            collected.append({
                "id": a["id"],
                "name": a["name"],
                "image": img_url
            })

    return {"results": collected}



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

def _normalize_ascii(s: str) -> str:
    # lower + убрать диакритику + оставить только a-z0-9 и пробелы
    s = s.lower()
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def _query_variants(q: str) -> list[str]:
    base = q.strip()
    low  = base.lower()
    variants = {
        base,
        low,
        low.replace("&", " and "),
        low.replace(".", " "),
        low.replace("$", "s"),           # $uicideboy$ -> suicideboys
        re.sub(r"[^\w\s]", " ", low),    # убрать всю пунктуацию
        _normalize_ascii(low),           # диакритика -> ascii
    }
    # Удалить лишние пробелы и пустые
    cleaned = []
    for v in variants:
        vv = re.sub(r"\s+", " ", v).strip()
        if vv:
            cleaned.append(vv)
    # Уникальные в исходном порядке
    seen, uniq = set(), []
    for v in cleaned:
        if v not in seen:
            uniq.append(v); seen.add(v)
    return uniq

# spotify_handler.py
def get_artist_info(artist_id: str):
    a = sp.artist(artist_id)
    return {
        "id": a.get("id"),
        "name": a.get("name"),
        "images": a.get("images", []),  # [ {url, width, height}, ...], как правило 0-й — самый большой
        "followers": a.get("followers", {}),
        "genres": a.get("genres", []),
        "popularity": a.get("popularity"),
    }
