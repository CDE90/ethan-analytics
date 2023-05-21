FROM rust:slim-buster as builder

RUN USER=root cargo new --bin ethan-analytics
WORKDIR /ethan-analytics

COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN cargo build --release
RUN rm src/*.rs

COPY ./src ./src

RUN rm ./target/release/deps/ethan_analytics*
RUN cargo build --release

FROM debian:buster-slim

RUN useradd -m -d /home/container container

USER container
ENV USER=container HOME=/home/container CARGO_HOME=/home/container/.cargo
WORKDIR /home/container

COPY --from=builder /ethan-analytics/target/release/ethan_analytics /home/container/ethan_analytics
COPY ./entrypoint.sh /entrypoint.sh

CMD ["/bin/bash", "/entrypoint.sh"]
