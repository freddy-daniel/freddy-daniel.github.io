#!/usr/bin/env bash
# One-shot cutover of the live site from freddydaniel.me to freddydaniel.dev.
#
# Run this ONLY after `dig +short freddydaniel.dev` returns the four GitHub
# Pages IPs (185.199.108-111.153). Running it earlier sets a custom domain
# that GitHub cannot verify, and the site becomes unreachable until DNS lands.
set -euo pipefail
cd "$(dirname "$0")"

NEW=freddydaniel.dev
REPO=freddy-daniel/freddy-daniel.github.io

echo "==> checking DNS for $NEW"
ips=$(dig +short "$NEW" A | sort | tr '\n' ' ')
echo "    resolves to: $ips"
case "$ips" in
  *185.199.108.153*|*185.199.109.153*|*185.199.110.153*|*185.199.111.153*) ;;
  *) echo "    DNS is not on GitHub Pages yet. Aborting."; exit 1;;
esac

echo "==> updating CNAME and canonical URL"
echo "$NEW" > public/CNAME
sed -i '' "s|site: 'https://freddydaniel.me'|site: 'https://$NEW'|" app/data/profile.ts
sed -i '' "s|https://freddydaniel.me|https://$NEW|g" README.md

echo "==> committing and pushing"
git add -A
git commit -m "chore: move custom domain to $NEW"
git push origin main

echo "==> pointing GitHub Pages at $NEW"
TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill | sed -n 's/^password=//p')
curl -fsS -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/pages" -d "{\"cname\":\"$NEW\"}"

echo "==> waiting for the TLS certificate"
for i in $(seq 1 40); do
  state=$(curl -fsS -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$REPO/pages" \
    | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).https_certificate?.state||'none'))")
  echo "    cert: $state"
  [ "$state" = "approved" ] && break
  sleep 15
done

curl -fsS -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/pages" -d '{"https_enforced":true}'

echo "==> done. verifying"
curl -s -o /dev/null -w "https://$NEW -> %%{http_code}\n" "https://$NEW/"
echo "Remember to delete the old Netlify deploy so it cannot serve stale content."
