use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use serde::Deserialize;

#[allow(warnings, unused)]
mod db;

use db::*;

#[derive(Deserialize)]
struct EventRequest {
    referrer: Option<String>,
    domain: String,
    event: String,
    page: String,
}

#[get("/")]
async fn index() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/api/event")]
async fn event_handler(
    req: HttpRequest,
    client: web::Data<PrismaClient>,
    event_req: web::Json<EventRequest>,
) -> impl Responder {
    let event_type = &event_req.event;
    let domain = &event_req.domain;
    let referrer = &event_req.referrer;
    let page = &event_req.page;

    let user_agent = match req.headers().get("user-agent") {
        Some(ua) => ua.to_str().unwrap_or(""),
        None => "",
    };

    match client
        .event()
        .create(
            page.to_string(),
            event_type.to_string(),
            website::url::equals(domain.to_string()),
            vec![
                event::referrer::set(referrer.clone()),
                event::user_agent::set(Some(user_agent.to_string())),
            ],
        )
        .exec()
        .await
    {
        Ok(_) => (),
        Err(_) => {
            return HttpResponse::InternalServerError().json(());
        }
    };

    HttpResponse::Ok().json(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let client = web::Data::new(
        PrismaClient::_builder()
            .build()
            .await
            .expect("Unable to connect to database"),
    );

    println!("Listening on port 8080, http://localhost:8080");

    HttpServer::new(move || {
        App::new()
            .app_data(client.clone())
            .service(index)
            .service(event_handler)
    })
    .bind(format!("0.0.0.0:{}", 8080))?
    .run()
    .await
}
