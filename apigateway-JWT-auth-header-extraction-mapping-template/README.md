## Amazon API Gateway Access Logging Setup

This snippet assumes that Amazon API Gateway logs requests to Amazon CloudWatch Logs using JSON and the following log format:

```json
{ 
"requestId": "$context.requestId", 
"ip": "$context.identity.sourceIp", 
"apiKey": "$context.identity.apiKey", 
"requestTime": "$context.requestTime", 
"httpMethod": "$context.httpMethod",
"routeKey": "$context.routeKey", 
"path":"$context.path", 
"status": "$context.status",
"protocol": "$context.protocol", 
"integrationStatus": "$context.integrationStatus", 
"integrationLatency": "$context.integrationLatency", 
"responseLatency": "$context.responseLatency", 
"responseLength": "$context.responseLength" 
}
```

You can modify log format to fit your needs (make sure to update code snippet if field names change). 


See documentation 
1. For more details on how to set up API Gateway logging in [HTTP](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-logging.html) and [REST](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html) APIs.
2. [Overriding request/response parameters and response status in Amazon API Gateway](https://aws.amazon.com/blogs/compute/overriding-request-response-parameters-and-response-status-in-amazon-api-gateway/)
3. [Context variable reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#context-variable-reference)
4. [Velocity template](https://velocity.apache.org/engine/devel/vtl-reference.html)