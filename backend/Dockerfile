# ---- build ----
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# ---- run ----
FROM eclipse-temurin:25-jre
WORKDIR /app
ENV TZ=Asia/Seoul \
    UPLOAD_DIR=/data/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -Djava.awt.headless=true"
RUN mkdir -p /data/uploads
COPY --from=build /app/target/homepage-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
