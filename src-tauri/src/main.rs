// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use tauri::Manager;
use rocket::fs::{ FileServer, NamedFile };
use rocket::{ get, routes, State };
use std::env;

#[get("/micropython")]
async fn micropython_route(base_paths: &State<BasePaths>) -> Option<NamedFile> {
    let index_path = base_paths.micropython_path.join("index.html");
    NamedFile::open(index_path).await.ok()
}

#[get("/scratch")]
async fn scratch_route(base_paths: &State<BasePaths>) -> Option<NamedFile> {
    let index_path = base_paths.scratch_path.join("index.html");
    NamedFile::open(index_path).await.ok()
}

#[derive(Clone)]
struct BasePaths {
    plode_path: PathBuf,
    micropython_path: PathBuf,
    scratch_path: PathBuf,
}

#[tokio::main]
async fn main() {
    tauri::Builder
        ::default()
        .setup(move |app| {
            let plode_path = app
                .path()
                .resolve("assets/plode_build", tauri::path::BaseDirectory::Resource)
                .unwrap();
            let micropython_path = app
                .path()
                .resolve("assets/micropython_build", tauri::path::BaseDirectory::Resource)
                .unwrap();
            let scratch_path = app
                .path()
                .resolve("assets/scratch_build", tauri::path::BaseDirectory::Resource)
                .unwrap();

            let base_paths = BasePaths {
                plode_path: plode_path.clone(),
                micropython_path: micropython_path.clone(),
                scratch_path: scratch_path.clone(),
            };

            tauri::async_runtime::spawn(async move {
                let port = env
                    ::var("PORT")
                    .unwrap_or_else(|_| "3123".to_string())
                    .parse::<u16>()
                    .unwrap_or(3123);

                let figment = rocket::Config
                    ::figment()
                    .merge(("port", port))
                    .merge(("address", "127.0.0.1"));

                let _ = rocket
                    ::custom(figment)
                    .manage(base_paths.clone())
                    // Serve static files from all directories
                    .mount("/", FileServer::from(base_paths.plode_path.clone()).rank(1))
                    .mount("/", FileServer::from(base_paths.micropython_path.clone()).rank(2))
                    .mount("/", FileServer::from(base_paths.scratch_path.clone()).rank(3))
                    // Handle specific routes
                    .mount("/", routes![micropython_route, scratch_route])
                    .ignite().await
                    .unwrap()
                    .launch().await;

                println!("Server started at port {}", port);
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
