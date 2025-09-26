#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// 파일 경로 얻기
fn get_trades_file_path(app: tauri::AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_data_dir)?;
    Ok(app_data_dir.join("trades.json"))
}

// 거래 파일 읽기
#[tauri::command]
fn read_trades_file(app: tauri::AppHandle) -> Result<String, String> {
    let file_path = get_trades_file_path(app).map_err(|e| e.to_string())?;
    
    if !file_path.exists() {
        // 기본 데이터로 초기화
        let default_data = r#"{
  "trades": [],
  "categories": [
    { "id": "all", "name": "전체", "description": "모든 매매 기록" },
    { "id": "profit", "name": "익절", "description": "수익 발생 매매" },
    { "id": "loss", "name": "손절", "description": "손실 발생 매매" },
    { "id": "recent", "name": "최근", "description": "최근 5개 매매" },
    { "id": "dashboard", "name": "대시보드", "description": "통계 대시보드" }
  ]
}"#;
        return Ok(default_data.to_string());
    }
    
    fs::read_to_string(&file_path).map_err(|e| e.to_string())
}

// 거래 파일 쓰기
#[tauri::command]
fn write_trades_file(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let file_path = get_trades_file_path(app).map_err(|e| e.to_string())?;
    fs::write(&file_path, data).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_trades_file, write_trades_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}