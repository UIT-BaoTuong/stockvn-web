# Bước 1: Build ứng dụng
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Copy các file cấu hình Gradle trước để cache các thư viện (dependencies)
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Cấp quyền thực thi cho file gradlew và tải dependencies
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon

# Copy toàn bộ code vào và build file jar
COPY src ./src
RUN ./gradlew bootJar --no-daemon

# Bước 2: Chạy ứng dụng
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy file .jar từ bước build sang (Gradle mặc định build ra thư mục build/libs)
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]  