package documentdb.sample;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.lambda.runtime.logging.LogLevel;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Updates;
import documentdb.sample.utils.DocumentDbUtil;
import documentdb.sample.utils.RequestUtil;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import java.util.List;
import java.util.Objects;

public class Update implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    MongoDatabase imdbDatabaseClient = DocumentDbUtil.getDocumentDbClient("imdb");

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent event, final Context context) {
        var response = new APIGatewayProxyResponseEvent().withHeaders(RequestUtil.CORS_HEADERS);

        try {
            var updateDoc = Document.parse(event.getBody());
            var moviesCollection = imdbDatabaseClient.getCollection("movies");
            var id = event.getPathParameters().get("id");
            var findDoc = new Document().append("_id", new ObjectId(id));

            List<Bson> updateOps = updateDoc.keySet().stream().map(
                    (key) -> Updates.set(key, updateDoc.get(key))
            ).toList();

            var updates = Updates.combine(updateOps);
            Objects.requireNonNull(
                    moviesCollection.findOneAndUpdate(findDoc, updates)
            );

            return response
                    .withStatusCode(204);
        } catch (Exception e) {
            context.getLogger().log(e.getMessage(), LogLevel.ERROR);
            return response
                    .withStatusCode(404);
        }
    }
}