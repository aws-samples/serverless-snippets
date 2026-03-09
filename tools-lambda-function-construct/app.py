#!/usr/bin/env python3

import aws_cdk as cdk

from cdk.cdk_stack import StandardLambdaExample


app = cdk.App()
StandardLambdaExample(
    app,
    "StandardLambdaExample",
)

app.synth()
