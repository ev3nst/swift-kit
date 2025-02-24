use std::collections::HashMap;

pub fn decode_html_entities(input: &str) -> String {
    let mut entities = HashMap::new();
    entities.insert("&amp;", "&");
    entities.insert("&lt;", "<");
    entities.insert("&gt;", ">");
    entities.insert("&quot;", "\"");
    entities.insert("&#39;", "'");
    entities.insert("&apos;", "'");
    entities.insert("&nbsp;", " ");

    let mut output = input.to_string();
    for (entity, char) in entities {
        output = output.replace(entity, char);
    }
    output
}
