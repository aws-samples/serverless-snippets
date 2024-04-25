// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
package example;

import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.signer.Aws4Signer;
import software.amazon.awssdk.auth.signer.params.Aws4PresignerParams;
import software.amazon.awssdk.http.SdkHttpFullRequest;
import software.amazon.awssdk.http.SdkHttpMethod;
import software.amazon.awssdk.regions.Region;

import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.net.URI;

public class IAMAuthTokenRequest {
    private static final SdkHttpMethod REQUEST_METHOD = SdkHttpMethod.GET;
    private static final String REQUEST_PROTOCOL = "https://";
    private static final String PARAM_ACTION = "Action";
    private static final String PARAM_USER = "User";
    private static final String ACTION_NAME = "connect";
    private static final String SERVICE_NAME = "memorydb";
    private static final Duration TOKEN_EXPIRY_SECONDS = Duration.ofSeconds(900);

    private final String userName;
    private final String clusterName;
    private final String region;

    public IAMAuthTokenRequest(String userName, String clusterName, String region) {
        this.userName = userName;
        this.clusterName = clusterName;
        this.region = region;
    }

    public String toSignedRequestUri(AwsCredentials credentials) {
        SdkHttpFullRequest request = getSignableRequest();
        SdkHttpFullRequest signedRequest = sign(request, credentials);

        return signedRequest.getUri().toString().replace(REQUEST_PROTOCOL, "");
    }

    private SdkHttpFullRequest getSignableRequest() {
        return SdkHttpFullRequest.builder()
                .method(REQUEST_METHOD)
                .uri(getRequestUri())
                .appendRawQueryParameter(PARAM_ACTION, ACTION_NAME)
                .appendRawQueryParameter(PARAM_USER, userName)
                .build();
    }

    private URI getRequestUri() {
        return URI.create(String.format("%s%s/", REQUEST_PROTOCOL, clusterName));
    }

    private SdkHttpFullRequest sign(SdkHttpFullRequest request, AwsCredentials credentials) {
        Instant expiresAt = Instant.now().plus(TOKEN_EXPIRY_SECONDS);

        Aws4Signer signer = Aws4Signer.create();

        Aws4PresignerParams params = Aws4PresignerParams.builder()
                .signingRegion(Region.of(region))
                .awsCredentials(credentials)
                .signingName(SERVICE_NAME)
                .expirationTime(expiresAt)
                .build();

        return signer.presign(request, params);
    }
}

RedisClusterClient client;
RedisAdvancedClusterCommands<String, String> redisCommands;

String userName = System.getenv("CACHE_USERNAME");
String clusterName = System.getenv("CACHE_CLUSTER_NAME");
String endpoint = System.getenv("CACHE_ENDPOINT");
String region = System.getenv("AWS_REGION");

AwsCredentialsProvider awsCredentialsProvider = DefaultCredentialsProvider.create();

// Create an IAM authentication token request and signed it using the AWS credentials.
// The pre-signed request URL is used as an IAM authentication token for MemoryDB Redis.
IAMAuthTokenRequest iamAuthTokenRequest = new IAMAuthTokenRequest(userName, clusterName, region);
String iamAuthToken = iamAuthTokenRequest.toSignedRequestUri(awsCredentialsProvider.resolveCredentials());

// Construct Redis URL with IAM Auth credentials provider
RedisURI redisURI = RedisURI.builder()
        .withHost(endpoint)
        .withPort(6379)
        .withSsl(true)
        .withAuthentication(userName, iamAuthToken)
        .build();

client = RedisClusterClient.create(redisURI);
redisCommands = client.connect().sync();