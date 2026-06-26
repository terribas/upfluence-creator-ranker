"""
Temporary exploration script — NOT for production.
Fetches 3 Fitness creators from Upfluence API and prints the full JSON payload
so we can inspect which signals are actually available.
"""

import json
import os
import subprocess

# ---------------------------------------------------------------------------
# 1. Load credentials from .env (no third-party deps needed)
# ---------------------------------------------------------------------------
def load_env(path=".env"):
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

env = load_env(os.path.join(os.path.dirname(__file__), ".env"))
CLIENT_ID  = env.get("UPFLUENCE_CLIENT_ID")  or os.environ.get("UPFLUENCE_CLIENT_ID")
SECRET_KEY = env.get("UPFLUENCE_SECRET_KEY") or os.environ.get("UPFLUENCE_SECRET_KEY")

if not CLIENT_ID or not SECRET_KEY:
    raise SystemExit("Missing UPFLUENCE_CLIENT_ID or UPFLUENCE_SECRET_KEY in .env")


# ---------------------------------------------------------------------------
# Helper — run a curl command and return parsed JSON
# ---------------------------------------------------------------------------
def curl_json(*args: str) -> dict:
    result = subprocess.run(["curl", "-s", *args], capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(f"curl error: {result.stderr}")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise SystemExit(f"Non-JSON response:\n{result.stdout[:500]}")


# ---------------------------------------------------------------------------
# 2. Auth — client_credentials grant
# ---------------------------------------------------------------------------
def get_access_token() -> str:
    print("\n[1/3] Authenticating …")
    data = curl_json(
        "-X", "POST", "https://identity.upfluence.co/token",
        "-H", "Content-Type: application/x-www-form-urlencoded",
        "-d", f"grant_type=client_credentials&client_id={CLIENT_ID}&client_secret={SECRET_KEY}",
    )
    token = data.get("access_token")
    if not token:
        raise SystemExit(f"Auth failed: {data}")
    print(f"    Token obtained (expires_in={data.get('expires_in')}s)")
    return token


# ---------------------------------------------------------------------------
# 3. Search — find 3 Fitness creators with at least 10k Instagram followers
# ---------------------------------------------------------------------------
def search_fitness_creators(token: str):
    print("\n[2/3] Searching Fitness creators …")
    body = json.dumps({
        "page": 1,
        "per_page": 3,
        "social_media_matching_operator": "or",
        "criterias": [
            {"type": "must", "field": "all", "value": "fitness"}
        ],
        "filters": [
            {
                "type": "range-int",
                "field": "instagram.followers",
                "value": {"from": 10000, "to": 10000000}
            }
        ],
        "ordering": {"value": "instagram.followers", "direction": "desc"}
    })

    data = curl_json(
        "-X", "POST", "https://api.upfluence.co/v1/matches",
        "-H", f"Authorization: Bearer {token}",
        "-H", "Content-Type: application/json",
        "-d", body,
    )
    influencers = data.get("influencers", [])
    print(f"    Found {len(influencers)} creator(s) in response (total in index: {data.get('total', '?')})")
    return influencers, data


# ---------------------------------------------------------------------------
# 4. Fetch full profile for each creator
# ---------------------------------------------------------------------------
def get_profile(token: str, influencer_id: int) -> dict:
    return curl_json(
        "-X", "GET", f"https://api.upfluence.co/v1/influencers/{influencer_id}",
        "-H", f"Authorization: Bearer {token}",
    )


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------
def main():
    token = get_access_token()
    influencers, raw_search = search_fitness_creators(token)

    print("\n[3/3] Fetching full profiles …")
    profiles = []
    for inf in influencers:
        inf_id = inf.get("id")
        print(f"    → influencer id={inf_id}")
        profile = get_profile(token, inf_id)
        profiles.append(profile)

    # -----------------------------------------------------------------------
    # Print results
    # -----------------------------------------------------------------------
    print("\n" + "=" * 70)
    print("RAW SEARCH RESPONSE (first result only — shows search-level fields)")
    print("=" * 70)
    if influencers:
        print(json.dumps(influencers[0], indent=2))

    print("\n" + "=" * 70)
    print("FULL PROFILES  (one per creator)")
    print("=" * 70)
    for p in profiles:
        print(json.dumps(p, indent=2))
        print("-" * 70)

    # Summarise top-level keys so we can quickly see available signal buckets
    print("\n" + "=" * 70)
    print("SIGNAL SUMMARY — top-level keys per profile")
    print("=" * 70)
    for p in profiles:
        name = (p.get("influencer") or {}).get("name", "unknown")
        print(f"\n  {name}:")
        for key in sorted(p.keys()):
            val = p[key]
            if isinstance(val, dict):
                sub = list(val.keys())[:8]
                print(f"    [{key}]: {sub}{'…' if len(val) > 8 else ''}")
            else:
                print(f"    [{key}]: {val}")


if __name__ == "__main__":
    main()
