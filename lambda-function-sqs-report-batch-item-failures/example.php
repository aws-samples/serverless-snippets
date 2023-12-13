<?php

function lambda_handler($event, $context) {
    if ($event) {
        $batch_item_failures = [];
        $sqs_batch_response = [];
     
        foreach ($event["Records"] as $record) {
            try {
                // process message
            } catch (Exception $e) {
                $batch_item_failures[] = ["itemIdentifier" => $record['messageId']];
            }
        }
        
        $sqs_batch_response["batchItemFailures"] = $batch_item_failures;
        return $sqs_batch_response;
    }
}

?>