# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package \
  && cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd -r fundflow && useradd -r -g fundflow fundflow
USER fundflow

COPY --from=build /workspace/app.jar /app/app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
