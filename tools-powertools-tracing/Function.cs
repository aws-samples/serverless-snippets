// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
﻿using Amazon.Lambda.Core;
using AWS.Lambda.Powertools.Tracing;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace Powertools.Trace
{
    public class Function
    {
        // Powertools Logger requires an environment variables against your function
        // POWERTOOLS_SERVICE_NAME

        [Tracing]
        public void Handler(object request, ILambdaContext context)
        {
            Tracing.AddAnnotation("annotation", "value");
            Tracing.AddMetadata("metadata", "sample");

            Tracing.WithSubsegment("loggingResponse", (subsegment) => {
                // Some business logic
            });
        }
    }
}