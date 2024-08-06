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
import org.bson.types.ObjectId;

public class Delete implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    MongoDatabase imdbDatabaseClient = DocumentDbUtil.getDocumentDbClient("imdb");

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent event, final Context context) {
        var response = new APIGatewayProxyResponseEvent().withHeaders(RequestUtil.CORS_HEADERS);
        try {
            var moviesCollection = imdbDatabaseClient.getCollection("movies");
            var id = event.getPathParameters().get("id");
            var deleteDoc = new Document().append("_id", new ObjectId(id));

            var deleteOneResponse = moviesCollection.deleteOne(deleteDoc);
            var responseJson = new Document().append("deletedItemsCount", deleteOneResponse.getDeletedCount());

            return response
                    .withStatusCode(200)
                    .withBody(responseJson.toJson());
        } catch (Exception e) {
            context.getLogger().log(e.getMessage(), LogLevel.ERROR);
            return response
                    .withStatusCode(500);
        }
    }
}
