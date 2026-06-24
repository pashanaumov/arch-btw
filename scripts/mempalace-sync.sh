#!/usr/bin/env sh
# Sync this project's mempalace memory to/from a committed, git-portable JSONL.
#
# WHY: the mempalace palace lives in ~/.mempalace (global, all projects, binary
# ChromaDB) and does NOT travel with a clone. This script surgically exports
# ONLY this project's drawers (scoped by wing/topic) to docs/memory/<wing>.jsonl
# as plain text, so they can be committed and re-hydrated on another machine.
#
# It is READ-ONLY against chroma.sqlite3 (never writes to the palace). Re-import
# is done additively via the mempalace API (see AGENTS.md), so it never clobbers
# other projects' memory and regenerates embeddings locally.
#
# Usage:
#   scripts/mempalace-sync.sh export      # palace -> docs/memory/<wing>.jsonl
#   scripts/mempalace-sync.sh status      # show counts without writing
set -eu

WING="${MEMPALACE_WING:-arch-btw}"
DB="${MEMPALACE_DB:-$HOME/.mempalace/palace/chroma.sqlite3}"
OUT="docs/memory/${WING}.jsonl"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "mempalace-sync: sqlite3 not found; skipping (memory will rebuild via 'mempalace mine .')" >&2
  exit 0
fi
if [ ! -f "$DB" ]; then
  echo "mempalace-sync: no palace at $DB; skipping" >&2
  exit 0
fi

# Ids of every drawer/diary entry scoped to this project.
SCOPE_SQL="SELECT id FROM embedding_metadata
           WHERE (key='wing'  AND string_value='${WING}')
              OR (key='topic' AND string_value='${WING}')"

# One JSON object per drawer: { id, meta:{ key:value, ... } } including chroma:document.
EXPORT_SQL="SELECT json_object('id', id, 'meta', json_group_object(key, value)) FROM (
              SELECT id, key,
                     coalesce(string_value,
                              cast(int_value   as text),
                              cast(float_value as text),
                              cast(bool_value  as text)) AS value
              FROM embedding_metadata
              WHERE id IN (${SCOPE_SQL})
            ) GROUP BY id;"

case "${1:-export}" in
  export)
    mkdir -p "$(dirname "$OUT")"
    sqlite3 "file:${DB}?mode=ro" "$EXPORT_SQL" > "$OUT"
    echo "mempalace-sync: exported $(wc -l < "$OUT" | tr -d ' ') drawer(s) for wing '${WING}' -> ${OUT}"
    ;;
  status)
    echo "wing '${WING}': $(sqlite3 "file:${DB}?mode=ro" "SELECT count(DISTINCT id) FROM (${SCOPE_SQL});") scoped drawer(s) in palace"
    ;;
  *)
    echo "usage: $0 {export|status}" >&2; exit 2;;
esac
