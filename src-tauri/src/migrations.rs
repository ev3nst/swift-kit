use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_settings_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE CHECK(length(name) <= 255),
                description TEXT NOT NULL CHECK(length(description) <= 255),
                value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Indexes for performance on commonly queried fields
            CREATE INDEX idx_setting_name ON settings (name);

            -- Trigger to automatically update the `updated_at` field on updates
            CREATE TRIGGER settings_updated_at
            AFTER UPDATE ON settings
            FOR EACH ROW
            BEGIN
                UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_notes_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL CHECK(length(title) <= 200),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Full-text search for the 'content' field
            CREATE VIRTUAL TABLE notes_fts USING fts5(title, content);

            -- Trigger to automatically update the `updated_at` field on updates
            CREATE TRIGGER notes_updated_at
            AFTER UPDATE ON notes
            FOR EACH ROW
            BEGIN
                UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_credentials_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS credentials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL CHECK(length(platform) <= 255),
                username TEXT NOT NULL CHECK(length(username) <= 255),
                password TEXT NOT NULL CHECK(length(password) <= 255),
                secret_question TEXT,
                secret_question_answer TEXT,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Indexes for performance on commonly queried fields
            CREATE INDEX idx_credential_platform ON credentials (platform);
            CREATE INDEX idx_credential_username ON credentials (username);

            -- Full-text search for the 'note' field
            CREATE VIRTUAL TABLE credentials_fts USING fts5(note);

            -- Trigger to automatically update the `updated_at` field on updates
            CREATE TRIGGER credentials_updated_at
            AFTER UPDATE ON credentials
            FOR EACH ROW
            BEGIN
                UPDATE credentials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_video_thumbnails_table",
            sql: r#"
            CREATE TABLE IF NOT EXISTS video_thumbnails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_path TEXT NOT NULL,
                thumbnail_folder TEXT NOT NULL CHECK(length(thumbnail_folder) <= 255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Indexes for performance on commonly queried fields
            CREATE INDEX idx_vt_video_path ON video_thumbnails (video_path);

            -- Trigger to automatically update the `updated_at` field on updates
            CREATE TRIGGER video_thumbnails_updated_at
            AFTER UPDATE ON video_thumbnails
            FOR EACH ROW
            BEGIN
                UPDATE video_thumbnails SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_movies_table",
            sql: r#"
			CREATE TABLE IF NOT EXISTS movies (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				scraped_url TEXT NOT NULL UNIQUE,
				title TEXT NOT NULL CHECK(length(title) <= 255),
				year INTEGER,
				release_date TEXT CHECK(length(release_date) <= 100),
				genre TEXT CHECK(length(genre) <= 255),
				description TEXT,
				keywords TEXT,
				cover TEXT,
				poster TEXT,
				trailer TEXT,
				duration INTEGER,
				country TEXT CHECK(length(country) <= 100),
				language TEXT CHECK(length(language) <= 100),
				imdb_rating REAL,
				personal_rating REAL,
				other_images TEXT,
				director TEXT CHECK(length(director) <= 150),
				writers TEXT,
				actors TEXT,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
					
			-- Indexes for performance on commonly queried fields
			CREATE INDEX idx_movie_scraped_url ON movies (scraped_url);
			CREATE INDEX idx_movie_title ON movies (title);
			CREATE INDEX idx_movie_year ON movies (year);
			CREATE INDEX idx_movie_genre ON movies (genre);
			CREATE INDEX idx_movie_imdb_rating ON movies (imdb_rating);
			CREATE INDEX idx_movie_personal_rating ON movies (personal_rating);

			-- Full-text search for 'title', 'description', 'keywords'
			CREATE VIRTUAL TABLE movies_fts USING fts5(title, description, keywords);
		
			-- Trigger to automatically update the `updated_at` field on updates
			CREATE TRIGGER movies_updated_at
			AFTER UPDATE ON movies
			FOR EACH ROW
			BEGIN
				UPDATE movies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
			END;
			"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_animes_table",
            sql: r#"
			CREATE TABLE IF NOT EXISTS animes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				scraped_url TEXT NOT NULL UNIQUE,
				franchise TEXT,
				title TEXT NOT NULL,
				original_title TEXT NOT NULL,
				year INTEGER,
				genre TEXT CHECK(length(genre) <= 255),
				description TEXT,
				episodes INTEGER,
				cover TEXT,
				poster TEXT,
				trailer TEXT,
				duration TEXT CHECK(length(genre) <= 255),
				studios TEXT,
				mal_rating REAL,
				personal_rating REAL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
					
			-- Indexes for performance on commonly queried fields
			CREATE INDEX idx_anime_scraped_url ON animes (scraped_url);
			CREATE INDEX idx_anime_title ON animes (title);
			CREATE INDEX idx_anime_original_title ON animes (original_title);
			CREATE INDEX idx_anime_year ON animes (year);
			CREATE INDEX idx_anime_genre ON animes (genre);
			CREATE INDEX idx_anime_mal_rating ON animes (mal_rating);
			CREATE INDEX idx_anime_personal_rating ON animes (personal_rating);

			-- Full-text search for 'title', 'original_title', 'description'
			CREATE VIRTUAL TABLE animes_fts USING fts5(title, original_title, description);
		
			-- Trigger to automatically update the `updated_at` field on updates
			CREATE TRIGGER animes_updated_at
			AFTER UPDATE ON animes
			FOR EACH ROW
			BEGIN
				UPDATE animes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
			END;
			"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_games_table",
            sql: r#"
			CREATE TABLE IF NOT EXISTS games (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				scraped_url TEXT NOT NULL UNIQUE,
				franchise TEXT,
				title TEXT NOT NULL,
				genre TEXT,
				description TEXT,
				about TEXT,
				release_date TEXT CHECK(length(release_date) <= 100),
				year INTEGER,
				developers TEXT CHECK(length(developers) <= 255),
				publishers TEXT CHECK(length(publishers) <= 255),
				cover TEXT,
				poster TEXT,
				trailer TEXT,
				other_images TEXT,
				personal_rating REAL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
					
			-- Indexes for performance on commonly queried fields
			CREATE INDEX idx_game_scraped_url ON games (scraped_url);
			CREATE INDEX idx_game_title ON games (title);
			CREATE INDEX idx_game_genre ON games (genre);
			CREATE INDEX idx_game_personal_rating ON games (personal_rating);

			-- Full-text search for 'title', 'description', 'about'
			CREATE VIRTUAL TABLE games_fts USING fts5(title, description, about);
		
			-- Trigger to automatically update the `updated_at` field on updates
			CREATE TRIGGER games_updated_at
			AFTER UPDATE ON games
			FOR EACH ROW
			BEGIN
				UPDATE games SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
			END;
			"#,
            kind: MigrationKind::Up,
        },
    ]
}
