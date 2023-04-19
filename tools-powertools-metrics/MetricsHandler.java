package helloworld;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.cloudwatchlogs.emf.model.DimensionSet;
import software.amazon.cloudwatchlogs.emf.model.Unit;
import software.amazon.lambda.powertools.metrics.Metrics;
import static software.amazon.lambda.powertools.metrics.MetricsUtils.metricsLogger;

/**
 * Handler for requests to Lambda function.
 */
public class MetricsHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static Logger log = LogManager.getLogger(MetricsHandler.class);

    @Metrics(namespace = "ExampleApplication", service = "booking", captureColdStart = true)
    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        Map<String, String> headers = new HashMap<>();

        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        metricsLogger.putDimensions(DimensionSet.of("environment", "prod"));
        metricsLogger().putMetric("CustomMetric1", 1, Unit.COUNT);

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent()
                .withHeaders(headers);
        try {
            final String pageContents = this.getPageContents("https://checkip.amazonaws.com");
            log.info(pageContents);
            String output = String.format("{ \"message\": \"hello world\", \"location\": \"%s\" }", pageContents);
            log.info("After output");
            return response
                    .withStatusCode(200)
                    .withBody(output);
        } catch (IOException | InterruptedException e) {
            return response
                    .withBody("{}")
                    .withStatusCode(500);
        }
    }

    private String getPageContents(String address) throws IOException {
        URL url = new URL(address);
        putMetadata("getPageContents", address);
        try (BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream()))) {
            return br.lines().collect(Collectors.joining(System.lineSeparator()));
        }
    }
}
