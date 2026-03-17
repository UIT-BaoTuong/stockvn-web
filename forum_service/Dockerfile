# Stage 1: Build bằng Gradle
FROM gradle:8.12-jdk21 AS build
WORKDIR /app
# Copy file cấu hình trước để cache dependencies
COPY build.gradle settings.gradle ./
COPY src ./src
# Build ra file jar (bỏ qua chạy test để nhanh hơn)
RUN gradle bootJar -x test

# Stage 2: Chạy bằng JRE nhẹ
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy file jar đã build từ Stage 1
COPY --from=build /app/build/libs/*.jar app.jar
# Mở cổng 8080 (như cấu hình trong properties)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]    