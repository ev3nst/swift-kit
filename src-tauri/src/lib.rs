use tauri_plugin_shell::ShellExt;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
async fn bunsidecar(
    app: tauri::AppHandle,
    command: String,
    args: Vec<String>,
) -> Result<String, String> {
    // Create the sidecar command
    let mut sidecar_command = app
        .shell()
        .sidecar("swift-kit-bun-sidecar")
        .map_err(|e| format!("Failed to create sidecar: {}", e))?
        .arg(command);

    for arg in args {
        sidecar_command = sidecar_command.arg(arg);
    }

    // Run the command
    let output = sidecar_command
        .output()
        .await
        .map_err(|e| format!("Failed to execute sidecar: {}", e))?;

    // Check if command failed
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Sidecar error: {}", stderr));
    }

    // Convert stdout to string
    String::from_utf8(output.stdout).map_err(|e| format!("Invalid UTF-8 output: {}", e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
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
            CREATE TRIGGER update_updated_at
            AFTER UPDATE ON notes
            FOR EACH ROW
            BEGIN
                UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
            "#,
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:swiftkit.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![bunsidecar])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
