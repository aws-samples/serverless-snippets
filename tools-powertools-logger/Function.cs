// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
﻿using Amazon.Lambda.Core;
using AWS.Lambda.Powertools.Logging;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Powertools.Logging
{
    public class Function
    {
        // Powertools Logger requires an environment variables against your function
        // POWERTOOLS_SERVICE_NAME
        [Logging(LogEvent = true)]
        public void Handler(object request, ILambdaContext context)
        {
            try
            {
                var requestContextRequestId = Guid.NewGuid().ToString();

                var lookupInfo = new Dictionary<string, object>()
                {
                    {"LookupInfo", new Dictionary<string, object>{{ "LookupId", requestContextRequestId }}}
                };

                // Append custom keys to the structured logs
                Logger.AppendKeys(lookupInfo);

                Logger.LogInformation("Getting ip address from external service");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Failure processing request");
            }
        }
    }
}