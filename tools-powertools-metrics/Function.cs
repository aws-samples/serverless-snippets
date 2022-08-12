using Amazon.Lambda.Core;
using AWS.Lambda.Powertools.Metrics;
using System.Diagnostics;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace ServerlessTestSamples
{
    public class Function
    {
        // Powertools Metrics require two environment variables against your function
        // POWERTOOLS_SERVICE_NAME
        // POWERTOOLS_METRICS_NAMESPACE

        // Capture cold starts as a specific metric
        [Metrics(CaptureColdStart = true)]
        public void Handler(object request, ILambdaContext context)
        {
            // Set default dimensions
            Metrics.SetDefaultDimensions(new Dictionary<string, string>()
            {
                { "Environment", "Prod" }
            });

            var watch = Stopwatch.StartNew();

            // Using PushSingleMetric allows defaults to be overridden
            Metrics.PushSingleMetric(
                metricName: "FunctionInvocation",
                value: 1,
                unit: MetricUnit.Count,
                service: "lambda-powertools-metrics-example",
                defaultDimensions: new Dictionary<string, string>
                {
                { "Metric Type", "Single" }
            });

            watch.Stop();

            // Add Metric to capture the amount of time 
            // Will use default dimensions if set
            Metrics.AddMetric("ElapsedExecutionTime", watch.ElapsedMilliseconds, MetricUnit.Milliseconds);
        }
    }
}