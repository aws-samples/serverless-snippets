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
import com.amazonaws.xray.AWSXRay;
import com.amazonaws.xray.entities.Entity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import software.amazon.lambda.powertools.tracing.CaptureMode;
import software.amazon.lambda.powertools.tracing.TracingUtils;
import software.amazon.lambda.powertools.tracing.Tracing;
import static software.amazon.lambda.powertools.tracing.TracingUtils.putMetadata;
import static software.amazon.lambda.powertools.tracing.TracingUtils.withEntitySubsegment;

/**
 * Handler for requests to Lambda function.
 */
public class TracingHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private final static Logger log = LogManager.getLogger(TracingHandler.class);

    @Tracing(captureMode = CaptureMode.RESPONSE_AND_ERROR)
    public APIGatewayProxyResponseEvent handleRequest(final APIGatewayProxyRequestEvent input, final Context context) {
        Map<String, String> headers = new HashMap<>();

        headers.put("Content-Type", "application/json");
        headers.put("X-Custom-Header", "application/json");

        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent()
                .withHeaders(headers);
        try {
            final String pageContents = this.getPageContents("https://checkip.amazonaws.com");
            log.info(pageContents);
            TracingUtils.putAnnotation("Test", "New");
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

    @Tracing(namespace = "getPageContents", captureMode = CaptureMode.DISABLED)
    private String getPageContents(String address) throws IOException {
        URL url = new URL(address);
        TracingUtils.putMetadata("getPageContents", address);
        try (BufferedReader br = new BufferedReader(new InputStreamReader(url.openStream()))) {
            return br.lines().collect(Collectors.joining(System.lineSeparator()));
        }
    }
}
