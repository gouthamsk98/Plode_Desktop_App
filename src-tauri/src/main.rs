// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tokio;
use axum::routing::get;
use tower_http::cors::{ CorsLayer, Any };
use socketioxide::SocketIo;
use tower_http::services::ServeDir;
use tauri::{ webview::WebviewWindowBuilder, WebviewUrl };
use tauri::Manager;
use axum::response::Html;

#[tokio::main]
async fn main() {
    tauri::Builder
        ::default()
        .setup(move |app| {
            // Create service to serve static files from dist folder
            // Spawn your async code inside the runtime
            let base_path = app
                .path()
                .resolve("assets/dist", tauri::path::BaseDirectory::Resource)
                .unwrap();
            let py_path = app
                .path()
                .resolve(
                    "assets/dist/micropython_build/index.html",
                    tauri::path::BaseDirectory::Resource
                )
                .unwrap();
            let scratch_path = app
                .path()
                .resolve(
                    "assets/dist/scratch_build/index.html",
                    tauri::path::BaseDirectory::Resource
                )
                .unwrap();
            let srach_dir = app
                .path()
                .resolve("assets/dist/scratch_build", tauri::path::BaseDirectory::Resource)
                .unwrap();
            println!("Base path: {:?}", base_path);
            println!("Python path: {:?}", py_path);
            tauri::async_runtime::spawn(async move {
                let (socketio_layer, io) = SocketIo::new_layer();
                let serve_dir = ServeDir::new(base_path);
                let serve_dir2 = ServeDir::new(srach_dir);
                // Example: Serve using warp or axum
                let app = axum::Router
                    ::new()
                    .route(
                        "/micropython",
                        get(move || async move {
                            let content = tokio::fs
                                ::read_to_string(py_path).await
                                .unwrap_or_else(|_|
                                    "<html><body>Error loading page</body></html>".to_string()
                                );
                            Html(content)
                        })
                    )
                    .route(
                        "/scratch",
                        get(move || async move {
                            let content = tokio::fs
                                ::read_to_string(scratch_path).await
                                .unwrap_or_else(|_|
                                    "<html><body>Error loading page</body></html>".to_string()
                                );
                            Html(content)
                        })
                    )
                    .fallback_service(serve_dir2)
                    .fallback_service(serve_dir)
                    .layer(socketio_layer);

                let listener = tokio::net::TcpListener::bind("0.0.0.0:3123").await.unwrap();
                axum::serve(listener, app).await.unwrap();
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
