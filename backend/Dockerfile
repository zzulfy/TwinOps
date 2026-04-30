FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace/backend
COPY backend/pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

COPY backend/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /workspace/backend/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar
COPY backend/sql /app/sql
COPY frontend/public/models/devices.glb /app/models/devices.glb

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
