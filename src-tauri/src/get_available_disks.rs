use std::{os::windows::process::CommandExt, process::Command};

#[tauri::command(rename_all = "snake_case")]
pub async fn get_available_disks() -> Result<Vec<String>, String> {
    if cfg!(target_os = "windows") {
        let available_disks = get_windows_drives()?;
        Ok(available_disks)
    } else if cfg!(target_os = "linux") {
        let available_disks = get_linux_mounts()?;
        Ok(available_disks)
    } else {
        Err("Unsupported OS".to_string())
    }
}

// Get list of valid Windows drives
pub fn get_windows_drives() -> Result<Vec<String>, String> {
    let output = Command::new("powershell")
        .creation_flags(0x08000000)
        .args(&[
            "-Command",
            "Get-PSDrive -PSProvider FileSystem | Select-Object -ExpandProperty Root",
        ])
        .output()
        .map_err(|e| format!("Failed to get Windows drives: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|s| s.trim().to_string())
        .collect())
}

// Get list of Linux mount points
pub fn get_linux_mounts() -> Result<Vec<String>, String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg("mount | awk '{print $3}'")
        .output()
        .map_err(|e| format!("Failed to get Linux mount points: {}", e))?;

    Ok(String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|s| s.trim().to_string())
        .collect())
}
