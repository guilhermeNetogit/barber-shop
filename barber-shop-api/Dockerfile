# Estágio 1: Build da aplicação
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia o pom.xml e baixa as dependências (cache de camadas do Docker)
COPY pom.xml ./
RUN mvn dependency:go-offline

# Copia o código fonte e faz o empacotamento
COPY src src
RUN mvn clean package -DskipTests

# Estágio 2: Execução da aplicação
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia apenas o jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Porta padrão que o Render expõe
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]