package documentdb.sample.utils;

import java.util.Map;

public class RequestUtil {
    public static final Map<String, String> CORS_HEADERS = Map.of(
            "Content-Type", "application/json",
            "Access-Control-Allow-Origin", "*",
            "Access-Control-Allow-Methods", "OPTIONS,GET,POST"
    );
}
