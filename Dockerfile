# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package \
  && cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache wget \
  && addgroup -S fundflow && adduser -S fundflow -G fundflow
USER fundflow

COPY --from=build /workspace/app.jar /app/app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
