using Amazon.Lambda.Core;
using Amazon.Lambda.S3Events;
using Amazon.S3;
using Amazon.S3.Model;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace integrationS3toLambda
{
    public class Function
    {
        public async Task<string> FunctionHandler(S3Event s3Event, ILambdaContext context)
        {
            
            var region = s3Event.Records?[0].AwsRegion;
            var bucket = s3Event.Records?[0].S3.Bucket.Name;
            var key = s3Event.Records?[0].S3.Object.Key;

            context.Logger.LogLine($"Bucket: {bucket}; Key: {key}");
            string responseBody = string.Empty;
            try {
                IAmazonS3 client = new AmazonS3Client(Amazon.RegionEndpoint.GetBySystemName(region));

                GetObjectRequest request = new GetObjectRequest {
                    BucketName = bucket,
                    Key = key
                };

                using (GetObjectResponse response = await client.GetObjectAsync(request))
                using (Stream responseStream = response.ResponseStream)
                using (StreamReader reader = new StreamReader(responseStream))
                {
                    responseBody = reader.ReadToEnd();
                };

                context.Logger.LogLine($"Processed message");
                return responseBody;
            }
            catch (AmazonS3Exception e)
            {
                // If bucket or object does not exist
                Console.WriteLine("Error encountered ***. Message:'{0}' when reading object", e.Message);
                return string.Empty;
            }
            catch (Exception e)
            {
                Console.WriteLine("Unknown encountered on server. Message:'{0}' when reading object", e.Message);
                return string.Empty;
            }
        }
    }
}
        