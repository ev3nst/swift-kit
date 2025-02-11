use tauri_plugin_sql::{Migration, MigrationKind};

mod bulk_rename;
mod fetch_files;
mod image_compress;
mod image_convert;
mod image_resize;
mod img_compressors;
mod rename_files;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
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
            CREATE INDEX idx_name ON settings (name);

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
            CREATE INDEX idx_platform ON credentials (platform);
            CREATE INDEX idx_username ON credentials (username);

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
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:swiftkit.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            fetch_files::fetch_files,
            bulk_rename::bulk_rename,
            rename_files::rename_files,
            image_convert::image_convert,
            image_compress::image_compress,
            image_resize::image_resize
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
