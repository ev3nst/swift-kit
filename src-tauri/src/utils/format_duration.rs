pub fn format_duration(seconds: f64, include_micro: bool) -> String {
    let total_seconds = seconds.round() as u64;
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let seconds = total_seconds % 60;
    if include_micro {
        format!("{:02}:{:02}:{:02}.000", hours, minutes, seconds)
    } else {
        format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
    }
}
