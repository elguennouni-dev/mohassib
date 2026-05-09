# syntax=docker/dockerfile:1.7

# --- Stage 1: build ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first.
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests dependency:go-offline

COPY src src
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests package \
    && cp target/mohassib-*.jar /app/app.jar

# --- Stage 2: runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Non-root user.
RUN groupadd --system --gid 1001 mohassib \
 && useradd  --system --uid 1001 --gid mohassib --no-create-home mohassib \
 && mkdir -p /app/storage /app/logs \
 && chown -R mohassib:mohassib /app

# curl is needed for the container HEALTHCHECK below.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=mohassib:mohassib /app/app.jar /app/app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    LOG_DIR=/app/logs \
    FILES_DIR=/app/storage \
    JAVA_OPTS="-Xms256m -Xmx512m"

EXPOSE 8080
USER mohassib

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS http://localhost:8080/api/v1/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
