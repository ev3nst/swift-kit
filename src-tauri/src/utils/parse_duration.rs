pub fn parse_duration(timestamp: &str) -> Option<f64> {
    let parts: Vec<&str> = timestamp.split(':').collect();
    if parts.len() != 3 {
        return None;
    }

    let hours: u64 = parts[0].parse().ok()?;
    let minutes: u64 = parts[1].parse().ok()?;
    let seconds: f64 = parts[2].parse().ok()?;

    Some((hours * 3600 + minutes * 60) as f64 + seconds)
}
