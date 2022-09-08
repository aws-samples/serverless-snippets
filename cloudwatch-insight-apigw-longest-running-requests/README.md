## Amazon API Gateway Access Logging Setup

This snippet assumes that Amazon API Gateway logs requests to Amazon CloudWatch Logs using JSON and the following log format:

```json
{ 
"requestId":"$context.requestId", 
"ip": "$context.identity.sourceIp", 
"apiKey": "$context.identity.apiKey", 
"requestTime":"$context.requestTime", 
"httpMethod":"$context.httpMethod",
"routeKey":"$context.routeKey", 
"path":"$context.path", 
"status": $context.status,
"protocol":"$context.protocol", 
"integrationStatus": $context.integrationStatus, 
"integrationLatency": $context.integrationLatency, 
"responseLatency":$context.responseLatency, 
"responseLength": $context.responseLength 
}
```

You can modify log format to fit your needs (make sure to update code snippet if field names change). 


See documentation for more details on how to set up API Gateway logging in HTTP (https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html) and REST (https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) APIs.