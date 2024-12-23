use std::process::Command;

pub fn get_default_browser() -> Result<String, Box<dyn std::error::Error>> {
    let output = Command::new("reg")
        .arg("query")
        .arg(r"HKEY_CURRENT_USER\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice")
        .arg("/v")
        .arg("ProgId")
        .output()?;

    let output_str = String::from_utf8_lossy(&output.stdout);
    if let Some(prog_id_line) = output_str.lines().find(|line| line.contains("ProgId")) {
        let parts: Vec<&str> = prog_id_line.split_whitespace().collect();
        if let Some(prog_id) = parts.last() {
            return Ok(match *prog_id {
                _ if prog_id.contains("ChromeHTML") => "chrome",
                _ if prog_id.contains("FirefoxURL") => "firefox",
                _ if prog_id.contains("IE.HTTP") => "iexplore",
                _ if prog_id.contains("MSEdgeHTM") => "edge",
                _ if prog_id.contains("Opera") => "opera",
                _ => "unknown",
            }
            .to_string());
        }
    }

    Ok("chrome".to_string())
}
