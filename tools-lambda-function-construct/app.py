#!/usr/bin/env python3
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import aws_cdk as cdk

from cdk.cdk_stack import StandardLambdaExample


app = cdk.App()
StandardLambdaExample(
    app,
    "StandardLambdaExample",
)

app.synth()
