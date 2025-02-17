pub fn is_valid_timestamp(ts: &Option<String>) -> bool {
    ts.as_ref()
        .map(|s| !s.is_empty() && s.split(':').count() == 3)
        .unwrap_or(false)
}
