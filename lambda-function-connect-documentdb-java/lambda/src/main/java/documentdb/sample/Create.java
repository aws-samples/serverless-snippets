package documentdb.sample;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.logging.LogLevel;
import com.mongodb.client.MongoDatabase;
import documentdb.sample.utils.DocumentDbUtil;
import documentdb.sample.utils.RequestUtil;
import org.bson.Document;

import java.util.Objects;

public class Create implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    MongoDatabase imdbDatabaseClient = DocumentDbUtil.getDocumentDbClient("imdb");

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent event, final Context context) {
        var response = new APIGatewayProxyResponseEvent().withHeaders(RequestUtil.CORS_HEADERS);

        try {
            var movies = imdbDatabaseClient.getCollection("movies");

            var json = Document.parse(event.getBody());

            var result = movies.insertOne(json);
            var responseJson = new Document().append("id",
                    Objects.requireNonNull(result.getInsertedId())
                            .asObjectId()
                            .getValue()
                            .toString());

            return response
                    .withStatusCode(201)
                    .withBody(responseJson.toJson());
        } catch (Exception e) {
            context.getLogger().log(e.getMessage(), LogLevel.ERROR);
            return response
                    .withStatusCode(500);
        }
    }
}
