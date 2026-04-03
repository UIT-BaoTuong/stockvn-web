FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy bộ khung
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# DevOps Trick: Tăng timeout và ÉP KHÔNG DÙNG TOOLCHAIN
ENV GRADLE_OPTS="-Dorg.gradle.internal.http.connectionTimeout=600000 -Dorg.gradle.internal.http.socketTimeout=600000"

RUN chmod +x ./gradlew

# Chạy tải dependencies nhưng ép dùng Java có sẵn trong hệ thống
RUN ./gradlew dependencies --no-daemon -Porg.gradle.java.installations.auto-download=false

COPY src ./src
# Build ra file jar
RUN ./gradlew bootJar -x test --no-daemon -Porg.gradle.java.installations.auto-download=false

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]   