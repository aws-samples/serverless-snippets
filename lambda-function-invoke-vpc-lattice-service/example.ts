// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
﻿// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import axios from "axios";

const endpointUrl = new URL(VPC_LATTICE_SERVICE_ENDPOINT);
const sigv4 = new SignatureV4({
    service: "vpc-lattice-svcs",
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN
    },
    sha256: Sha256
});

const signedRequest = await sigv4.sign({
    method: "PUT",
    hostname: endpointUrl.host,
    path: endpointUrl.pathname,
    protocol: endpointUrl.protocol,
    headers: {
        'Content-Type': 'application/json',
        host: endpointUrl.hostname,
        // Include following header as VPC Lattice does not support signed payloads
        "x-amz-content-sha256": "UNSIGNED-PAYLOAD"
    }
  });    
  const { data } = await axios({
    ...signedRequest,
    data: {
        // some data
    },
    url: VPC_LATTICE_SERVICE_ENDPOINT
  });
