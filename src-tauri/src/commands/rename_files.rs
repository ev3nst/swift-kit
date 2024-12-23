use std::fs;
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
pub fn rename_files(
    folder_path: String,
    rename_mapping: Option<Vec<(String, String)>>,
    replace_rule: Option<String>, 
) -> Result<Vec<String>, String> {
    if rename_mapping.is_some() && replace_rule.is_some() {
        return Err("Please choose either individual renaming or bulk renaming, not both.".to_string());
    }

    let path = Path::new(&folder_path);
    if !path.exists() {
        return Err("The provided folder path does not exist.".to_string());
    }
    if !path.is_dir() {
        return Err("The provided path is not a directory.".to_string());
    }

    // If rename_mapping is provided, use it for individual renaming
    let mut renamed_files = Vec::new();
    if let Some(mapping) = rename_mapping {
        for (old_name, new_name) in mapping {
            if new_name.is_empty() {
                continue; 
            }

            let old_path = path.join(&old_name);
            let new_path = path.join(&new_name);
            if old_path.exists() {
                if let Err(err) = fs::rename(&old_path, &new_path) {
                    return Err(format!("Failed to rename {}: {}", old_name, err));
                }
                renamed_files.push(new_name);
            } else {
                return Err(format!("File not found: {}", old_name));
            }
        }
    }

    // If replace_rule is provided, use it for bulk renaming
    if let Some(rule) = replace_rule {
        let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;
        for entry in entries {
            if let Ok(entry) = entry {
                let file_name = entry.file_name().into_string().unwrap_or_default();

                // Check if the rule is a valid replacement
                if let Some((old_substring, new_substring)) = parse_replace_rule(&rule) {
                    if file_name.contains(&old_substring) {
                        let new_name = file_name.replace(&old_substring, &new_substring);
                        let old_path = entry.path();
                        let new_path = path.join(&new_name);
                        if let Err(err) = fs::rename(&old_path, &new_path) {
                            return Err(format!("Failed to rename {}: {}", file_name, err));
                        }
                        renamed_files.push(new_name);
                    }
                }
            }
        }
    }

    Ok(renamed_files)
}

/// Helper function to parse the replace rule (e.g., "asd-,")
fn parse_replace_rule(rule: &str) -> Option<(String, String)> {
    let parts: Vec<&str> = rule.split(',').collect();
    if parts.len() == 2 {
        Some((parts[0].to_string(), parts[1].to_string()))
    } else {
        None
    }
}
