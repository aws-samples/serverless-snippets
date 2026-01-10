public class Customer
{
    public string? CustomerId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }
}

internal class TypedDynamoDbRecordHandler : ITypedRecordHandler<Customer> 
{
    public async Task<RecordHandlerResult> HandleAsync(Customer customer, CancellationToken cancellationToken)
    {
        Logger.LogInformation($"Processing customer {customer.CustomerId} - {customer.Name}");

        if (string.IsNullOrEmpty(customer.Email)) 
        {
            throw new ArgumentException("Customer email is required");
        }

        return await Task.FromResult(RecordHandlerResult.None); 
    }
}

[BatchProcessor(TypedRecordHandler = typeof(TypedDynamoDbRecordHandler))]
public BatchItemFailuresResponse HandlerUsingTypedAttribute(DynamoDBEvent _)
{
    return TypedDynamoDbStreamBatchProcessor.Result.BatchItemFailuresResponse; 
}