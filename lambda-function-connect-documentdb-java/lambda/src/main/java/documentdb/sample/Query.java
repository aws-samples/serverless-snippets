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
import org.bson.conversions.Bson;

import java.util.LinkedList;
import java.util.Map;

import static com.mongodb.client.model.Filters.*;

public class Query implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    MongoDatabase imdbDatabaseClient = DocumentDbUtil.getDocumentDbClient("imdb");

    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent event, final Context context) {
        var response = new APIGatewayProxyResponseEvent().withHeaders(RequestUtil.CORS_HEADERS);
        var moviesCollection = imdbDatabaseClient.getCollection("movies");

        var queryParams = event.getQueryStringParameters();

        try {
            boolean filterResults = queryParams != null && !queryParams.isEmpty();

            var movies = filterResults ?
                    moviesCollection.find(getAndComparison(queryParams)) :
                    moviesCollection.find();

            var json = new Document()
                    .append("movies", movies);

            return response
                    .withStatusCode(200)
                    .withBody(json.toJson());
        } catch (Exception e) {
            context.getLogger().log(e.getMessage(), LogLevel.ERROR);
            return response
                    .withStatusCode(500);
        }
    }

    private static Bson getAndComparison(Map<String, String> queryParams) {
        var comparators = new LinkedList<Bson>();

        if (queryParams.containsKey("yearFrom")) {
            comparators.add(
                    gte("Year", Integer.valueOf(queryParams.get("yearFrom")))
            );
        }

        if (queryParams.containsKey("yearTo")) {
            comparators.add(
                    lte("Year", Integer.valueOf(queryParams.get("yearTo")))
            );
        }

        if (queryParams.containsKey("title")) {
            comparators.add(
                    regex("Title", queryParams.get("title"))
            );
        }

        return and(comparators);
    }
}
