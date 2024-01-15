//Make sure you have Bref installed and the necessary dependencies. Run the following commands in your project directory:
//composer require bref/bref
//composer install


<?php

use Bref\Context\Context;
use Bref\Event\SqsEvent;


function lambda_handler(SQSEvent $event, Context $context) {
    if ($event) {
        $batch_item_failures = [];
        $sqs_batch_response = [];
     
        foreach ($event->getRecords() as $record) {
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