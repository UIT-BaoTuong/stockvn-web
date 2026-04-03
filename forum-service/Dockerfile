# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# 1. Copy bộ khung Gradle trước để tận dụng Docker Cache
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle settings.gradle ./

# DevOps Trick: Tăng timeout để chống chọi với mạng lag (10 phút)
# Và ép Gradle không tự tải Java Toolchain (tiết kiệm thời gian/băng thông)
ENV GRADLE_OPTS="-Dorg.gradle.internal.http.connectionTimeout=600000 -Dorg.gradle.internal.http.socketTimeout=600000"

RUN chmod +x ./gradlew

# 2. Tải các thư viện (dependencies) về trước
# Thêm cờ tắt auto-download Java để dùng luôn Java có sẵn trong Image
RUN ./gradlew dependencies --no-daemon -Porg.gradle.java.installations.auto-download=false || true

# 3. Copy code nguồn và Build file JAR
COPY src ./src
RUN ./gradlew bootJar -x test --no-daemon -Porg.gradle.java.installations.auto-download=false

# Stage 2: Runtime (Dùng JRE cho nhẹ, tối ưu tài nguyên trên Azure)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file jar từ bước build sang
COPY --from=build /app/build/libs/*.jar app.jar

# Port mặc định của Forum Service thường là 8081 hoặc 8080 tùy bạn config
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]  