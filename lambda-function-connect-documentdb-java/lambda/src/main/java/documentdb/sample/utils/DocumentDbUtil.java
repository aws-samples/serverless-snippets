package documentdb.sample.utils;

import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class DocumentDbUtil {
    public static MongoDatabase getDocumentDbClient(String database) {
        var documentDBSecretName = System.getenv("DOCUMENTDB_SECRET_NAME");
        var secretsClient = SecretsManagerClient.builder()
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();

        var getSecretValueRequest = GetSecretValueRequest.builder()
                .secretId(documentDBSecretName)
                .build();

        var secret = secretsClient.getSecretValue(getSecretValueRequest).secretString();
        var parsedSecret = Document.parse(secret);

        var documentDBEndpoint = parsedSecret.getString("host");
        var documentDBUsername =  parsedSecret.getString("username");
        var documentDBPassword =  parsedSecret.getString("password");
        var template = "mongodb://%s:%s@%s/mydb?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false&directConnection=true";

        var connectionString = String.format(template, documentDBUsername, URLEncoder.encode(documentDBPassword, StandardCharsets.UTF_8), documentDBEndpoint);

        var mongoClient = MongoClients.create(connectionString);
        return mongoClient.getDatabase(database);
    }
}
