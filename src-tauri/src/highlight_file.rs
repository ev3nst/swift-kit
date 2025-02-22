use std::path::Path;
use std::{os::windows::process::CommandExt, process::Command};

#[tauri::command(rename_all = "snake_case")]
pub fn highlight_file(file_path: String) -> Result<(), String> {
    let sanitized_path = sanitize_path(&file_path)?;

    if !Path::new(&sanitized_path).is_file() {
        return Err("The provided path is not a valid file.".to_string());
    }

    let command = if cfg!(target_os = "windows") {
        format!("explorer /select,{}", sanitized_path)
    } else {
        return Err("Unsupported OS".to_string());
    };

    Command::new("cmd")
        .creation_flags(0x08000000)
        .arg("/C")
        .arg(command)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn sanitize_path(file_path: &str) -> Result<String, String> {
    let path = Path::new(file_path);
    let sanitized_path = path
        .to_str()
        .ok_or_else(|| "Invalid file path".to_string())?;
    let safe_path = sanitized_path
        .replace(";", "")
        .replace("&", "")
        .replace("|", "")
        .replace("`", "");
    if safe_path != sanitized_path {
        return Err("Unsafe characters detected in file path.".to_string());
    }

    Ok(safe_path.to_string())
}
