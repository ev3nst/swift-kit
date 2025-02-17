use std::sync::{Arc, Mutex};
use tauri::Window;

pub struct AppWindowState {
    pub is_pinned: bool,
}

#[tauri::command(rename_all = "snake_case")]
pub fn always_on_top(
    window: Window,
    only_state: bool,
    state: tauri::State<Arc<Mutex<AppWindowState>>>,
) -> bool {
    let mut state = state.lock().unwrap();

    if only_state {
        return state.is_pinned;
    }

    let new_state = !state.is_pinned;
    window.set_always_on_top(new_state).unwrap();
    state.is_pinned = new_state;
    new_state
}
