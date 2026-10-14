# Estágio 1: Build da aplicação
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copia os arquivos de configuração do Maven e o código fonte
mvnw pom.xml ./
COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src

# Dá permissão de execução para o mvnw e faz o build empacotando o jar
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Estágio 2: Execução da aplicação
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia apenas o jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Porta padrão que o Render expõe
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]