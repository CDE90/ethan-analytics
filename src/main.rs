use actix_web::{
    dev::Payload, get, post, web, App, FromRequest, HttpRequest, HttpResponse, HttpServer,
    Responder,
};
use actix_web_location::Location;
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

fn option_from_string(string: String) -> Option<String> {
    if string == "" {
        None
    } else {
        Some(string)
    }
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

    let user_agent = req.headers().get("user-agent").unwrap().to_str().unwrap();

    let location = Location::from_request(&req, &mut Payload::None)
        .await
        .unwrap();

    let region_str = location.region();
    let country_str = location.country();
    let city_str = location.city();

    let region = option_from_string(region_str);
    let country = option_from_string(country_str);
    let city = option_from_string(city_str);

    client
        .event()
        .create(
            page.to_string(),
            event_type.to_string(),
            website::url::equals(domain.to_string()),
            vec![
                event::referrer::set(referrer.clone()),
                event::user_agent::set(Some(user_agent.to_string())),
                event::region::set(region),
                event::country::set(country),
                event::city::set(city),
            ],
        )
        .exec()
        .await
        .unwrap();

    HttpResponse::Ok().json(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let client = web::Data::new(PrismaClient::_builder().build().await.unwrap());

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
