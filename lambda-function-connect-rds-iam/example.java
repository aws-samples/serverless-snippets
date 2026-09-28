import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rds.RdsUtilities;
import software.amazon.awssdk.services.rds.model.GenerateAuthenticationTokenRequest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class RdsLambdaHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();

        // DBHostName is the RDS instance/cluster endpoint. An RDS Proxy is not
        // required for IAM authentication; point this directly at your DB endpoint.
        String dbHostName = System.getenv("DBHostName");
        int port = Integer.parseInt(System.getenv("Port"));
        String dbName = System.getenv("DBName");
        String dbUserName = System.getenv("DBUserName");
        String region = System.getenv("AWS_REGION");

        try {
            // Obtain auth token
            String token = createAuthToken(dbHostName, port, dbUserName, region);

            // Define connection configuration
            String connectionString = String.format("jdbc:mysql://%s:%d/%s?useSSL=true&requireSSL=true",
                    dbHostName, port, dbName);

            // Establish a connection to the database
            try (Connection connection = DriverManager.getConnection(connectionString, dbUserName, token);
                 PreparedStatement statement = connection.prepareStatement("SELECT ? + ? AS sum")) {

                statement.setInt(1, 3);
                statement.setInt(2, 2);

                try (ResultSet resultSet = statement.executeQuery()) {
                    if (resultSet.next()) {
                        int sum = resultSet.getInt("sum");
                        response.setStatusCode(200);
                        response.setBody("The selected sum is: " + sum);
                    }
                }
            }

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setBody("Error: " + e.getMessage());
        }

        return response;
    }

    // Generate an IAM authentication token for the RDS DB endpoint.
    private String createAuthToken(String hostName, int port, String userName, String region) {
        RdsUtilities rdsUtilities = RdsUtilities.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();

        GenerateAuthenticationTokenRequest tokenRequest = GenerateAuthenticationTokenRequest.builder()
                .hostname(hostName)
                .port(port)
                .username(userName)
                .build();

        return rdsUtilities.generateAuthenticationToken(tokenRequest);
    }
}
