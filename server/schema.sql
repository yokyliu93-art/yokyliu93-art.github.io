PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS agent_presence(credential_id TEXT PRIMARY KEY, user_id TEXT NOT NULL, island_id TEXT NOT NULL, name TEXT NOT NULL, hello TEXT NOT NULL, connected_at TEXT NOT NULL, last_seen TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS island_letters(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,island_id TEXT NOT NULL,kind TEXT NOT NULL,source_key TEXT NOT NULL,input TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'queued',report TEXT,error TEXT,attempts INTEGER NOT NULL DEFAULT 0,lease TEXT,lease_until TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(user_id,source_key));
CREATE INDEX IF NOT EXISTS letters_owner ON island_letters(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS island_letter_images(letter_id TEXT NOT NULL,panel INTEGER NOT NULL,user_id TEXT NOT NULL,mime TEXT NOT NULL,data BLOB NOT NULL,PRIMARY KEY(letter_id,panel));
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS account_logins(user_id TEXT PRIMARY KEY REFERENCES users(id),email TEXT NOT NULL UNIQUE,password_salt TEXT NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS islands(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL UNIQUE REFERENCES users(id),name TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,discoverable INTEGER NOT NULL DEFAULT 0,scene TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS credentials(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),island_id TEXT REFERENCES islands(id),kind TEXT NOT NULL CHECK(kind IN ('human','agent')),token_hash TEXT NOT NULL UNIQUE,scopes TEXT NOT NULL,expires_at TEXT NOT NULL,revoked_at TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,actor_id TEXT NOT NULL REFERENCES users(id),credential_id TEXT NOT NULL REFERENCES credentials(id),island_id TEXT REFERENCES islands(id),action TEXT NOT NULL,detail TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS encounter_rounds(day TEXT PRIMARY KEY,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS encounters(id TEXT PRIMARY KEY,island_a TEXT NOT NULL REFERENCES islands(id),island_b TEXT NOT NULL REFERENCES islands(id),day TEXT NOT NULL,probability REAL NOT NULL,compatibility REAL NOT NULL,draw REAL NOT NULL,occurred INTEGER NOT NULL,explanation TEXT NOT NULL,created_at TEXT NOT NULL,UNIQUE(island_a,island_b,day));
CREATE TABLE IF NOT EXISTS encounters_seen(encounter_id TEXT NOT NULL REFERENCES encounters(id),user_id TEXT NOT NULL REFERENCES users(id),PRIMARY KEY(encounter_id,user_id));
CREATE TABLE IF NOT EXISTS bonds(id TEXT PRIMARY KEY,island_a TEXT NOT NULL REFERENCES islands(id),island_b TEXT NOT NULL REFERENCES islands(id),proposed_by TEXT NOT NULL REFERENCES users(id),accepted_by TEXT REFERENCES users(id),status TEXT NOT NULL CHECK(status IN ('pending','active','declined','separated')),created_at TEXT NOT NULL,ended_at TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS bond_pair ON bonds(island_a,island_b) WHERE status IN ('pending','active');
CREATE TABLE IF NOT EXISTS shared_spaces(id TEXT PRIMARY KEY,bond_id TEXT NOT NULL UNIQUE REFERENCES bonds(id),revision INTEGER NOT NULL DEFAULT 0,archived INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS shared_objects(id TEXT PRIMARY KEY,space_id TEXT NOT NULL REFERENCES shared_spaces(id),owner_id TEXT NOT NULL REFERENCES users(id),payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS returned_objects(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL REFERENCES users(id),source_space TEXT NOT NULL REFERENCES shared_spaces(id),payload TEXT NOT NULL,returned_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS blocks(user_id TEXT NOT NULL REFERENCES users(id),blocked_user_id TEXT NOT NULL REFERENCES users(id),PRIMARY KEY(user_id,blocked_user_id));
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS creations(id TEXT PRIMARY KEY,island_id TEXT NOT NULL REFERENCES islands(id),owner_id TEXT NOT NULL REFERENCES users(id),credential_id TEXT NOT NULL REFERENCES credentials(id),revision INTEGER NOT NULL,prompt TEXT NOT NULL,status TEXT NOT NULL,summary TEXT,error TEXT,before_scene TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS user_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id),payload TEXT NOT NULL,source TEXT NOT NULL DEFAULT 'user_onboarding',updated_at TEXT NOT NULL);

-- Tideline-inspired account memory. Raw context and structured narrative are
-- separated so a compact memory can always link back to its original source.
CREATE TABLE IF NOT EXISTS memory_context(
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 island_id TEXT REFERENCES islands(id) ON DELETE CASCADE,
 source TEXT NOT NULL CHECK(source IN ('onboarding','agent_dialogue','island_change','relationship','user_note')),
 content TEXT NOT NULL,
 meta TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS memory_context_owner_time ON memory_context(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS memory_narratives(
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 island_id TEXT REFERENCES islands(id) ON DELETE CASCADE,
 ntype TEXT NOT NULL CHECK(ntype IN ('preference','creation','relationship','reflection','general')),
 gesture TEXT NOT NULL,
 context_layer TEXT NOT NULL,
 cognition_direction TEXT NOT NULL,
 tags TEXT NOT NULL DEFAULT '[]',
 related_entities TEXT NOT NULL DEFAULT '[]',
 source_links TEXT NOT NULL DEFAULT '[]',
 importance INTEGER NOT NULL CHECK(importance BETWEEN 1 AND 5),
 emotional INTEGER NOT NULL CHECK(emotional BETWEEN 1 AND 5),
 recurrence INTEGER NOT NULL CHECK(recurrence BETWEEN 1 AND 5),
 unresolved INTEGER NOT NULL CHECK(unresolved BETWEEN 1 AND 5),
 weight REAL NOT NULL CHECK(weight BETWEEN 0 AND 1),
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS memory_narratives_owner_time ON memory_narratives(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS memory_amendments(
 id TEXT PRIMARY KEY,
 narrative_id TEXT NOT NULL REFERENCES memory_narratives(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 content TEXT NOT NULL,
 reason TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS memory_self_concept(
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 field TEXT NOT NULL CHECK(field IN ('fact','terrain','self_reflection')),
 content TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(user_id,field)
);
CREATE TABLE IF NOT EXISTS memory_self_concept_history(
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 field TEXT NOT NULL,
 old_content TEXT NOT NULL,
 archived_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS memory_settings(
 user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 matching_enabled INTEGER NOT NULL DEFAULT 0,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS relationship_scores(
 id TEXT PRIMARY KEY,
 user_a TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 user_b TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 compatibility REAL NOT NULL,
 components TEXT NOT NULL,
 algorithm_version TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS relationship_scores_pair_time ON relationship_scores(user_a,user_b,created_at DESC);

CREATE TABLE IF NOT EXISTS avatars(user_id TEXT PRIMARY KEY REFERENCES users(id),revision INTEGER NOT NULL DEFAULT 0,source TEXT NOT NULL,updated_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS memory_imports(user_id TEXT NOT NULL REFERENCES users(id),external_id TEXT NOT NULL,narrative_id TEXT NOT NULL REFERENCES memory_narratives(id) ON DELETE CASCADE,PRIMARY KEY(user_id,external_id));

CREATE TABLE IF NOT EXISTS island_profiles(user_id TEXT PRIMARY KEY REFERENCES users(id),revision INTEGER NOT NULL,answers TEXT NOT NULL,profile TEXT NOT NULL,mirror TEXT NOT NULL,confirmed INTEGER NOT NULL DEFAULT 0,analysis_consent INTEGER NOT NULL DEFAULT 0,matching_consent INTEGER NOT NULL DEFAULT 0,snapshot TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS island_profile_history(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),payload TEXT NOT NULL,revision INTEGER NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS island_daily_cards(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),day TEXT NOT NULL,text TEXT NOT NULL,evidence TEXT NOT NULL,favorite INTEGER NOT NULL DEFAULT 0,response TEXT,created_at TEXT NOT NULL,UNIQUE(user_id,day));
CREATE INDEX IF NOT EXISTS island_card_owner_time ON island_daily_cards(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS island_listening(user_id TEXT PRIMARY KEY REFERENCES users(id),track TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS island_reflection_jobs(user_id TEXT PRIMARY KEY REFERENCES users(id),nonce TEXT NOT NULL,expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS island_psyche_preferences(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,mbti TEXT,updated_at TEXT NOT NULL);
