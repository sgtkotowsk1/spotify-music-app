FROM gradle:8.5-jdk17-alpine AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon
COPY src src
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
