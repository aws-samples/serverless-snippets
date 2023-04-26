using Amazon.Lambda.Core;
using Amazon.Lambda.SQSEvents;
using static Amazon.Lambda.SQSEvents.SQSBatchResponse;


// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace SqsIntegration;

public class Function
{

    private List<BatchItemFailure> _batchItemFailures = new();

    /// <summary>
    /// Default constructor. This constructor is used by Lambda to construct the instance. When invoked in a Lambda environment
    /// the AWS credentials will come from the IAM role associated with the function and the AWS region will be set to the
    /// region the Lambda function is executed in.
    /// </summary>
    public Function()
    {

    }


    /// <summary>
    /// This method is called for every Lambda invocation. This method takes in an SQS event object and can be used 
    /// to respond to SQS messages.
    /// </summary>
    /// <param name="evnt"></param>
    /// <param name="context"></param>
    /// <returns></returns>
    public async Task<SQSBatchResponse> FunctionHandler(SQSEvent evnt, ILambdaContext context)
    {
        if (evnt.Records.Count <= 0)
        {
            context.Logger.LogLine("Empty SQS Event received");
            return new SQSBatchResponse();
        }

        foreach (var message in evnt.Records)
        {
            BatchItemFailure? result = await ProcessMessageAsync(message, context);
            if (result != null)
            {
                _batchItemFailures.Add(result);
            }
        }

        return new SQSBatchResponse(_batchItemFailures);
    }

    private async Task<BatchItemFailure?> ProcessMessageAsync(SQSEvent.SQSMessage message, ILambdaContext context)
    {
        try
        {
            context.Logger.LogInformation($"Processed message {message.Body}");
            // TODO: Do interesting work based on the new message
            return null;

        }
        catch (Exception e)
        {
            context.Logger.LogError($"Error processing request - {e.Message}");
            return new BatchItemFailure { ItemIdentifier = message.MessageId };
        }
    }
}