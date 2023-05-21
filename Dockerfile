FROM rust:slim-buster as builder

RUN USER=root cargo new --bin ethan-analytics
WORKDIR /ethan-analytics

RUN apt-get update && apt-get install -y \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
COPY ./prisma-cli ./prisma-cli
COPY ./prisma ./prisma
COPY ./.cargo ./.cargo

RUN cargo build --release
RUN rm src/*.rs

COPY ./src ./src


RUN rm ./target/release/deps/ethan_analytics*

# Delete the first 4 lines of the schema.prisma file
# Slightly cheaty way to avoid trying to generate the js client
RUN tail -n +5 ./prisma/schema.prisma > ./prisma/schema.prisma.tmp && mv ./prisma/schema.prisma.tmp ./prisma/schema.prisma

RUN cargo prisma generate

RUN cargo build --release


FROM debian:buster-slim


RUN apt update \
    && apt install -y iproute2 libssl-dev ca-certificates \
    && useradd -m -d /home/container container

USER container
ENV USER=container HOME=/home/container CARGO_HOME=/home/container/.cargo
WORKDIR /home/container

COPY --from=builder /ethan-analytics/target/release/ethan-analytics /home/container/ethan-analytics
COPY ./entrypoint.sh /entrypoint.sh

EXPOSE 3001

CMD ["/bin/bash", "/entrypoint.sh"]
