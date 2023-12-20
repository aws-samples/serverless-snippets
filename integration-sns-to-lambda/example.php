<?php

/* 
Since native PHP support for AWS Lambda is not available, we are utilizing Bref's PHP functions runtime for AWS Lambda.
For more information on Bref's PHP runtime for Lambda, refer to: https://bref.sh/docs/runtimes/function

Another approach would be to create a custom runtime. 
A practical example can be found here: https://aws.amazon.com/blogs/apn/aws-lambda-custom-runtime-for-php-a-practical-example/
*/

require __DIR__ . '/vendor/autoload.php';

return function ($event, $context) {
    foreach ($event["Records"] as $record) {
        processMessage($record);
    }
    echo "Done!" . PHP_EOL;
};

function processMessage($record)
{
    try {
        $message = $record['Sns']['Message'];
        echo "Processed Message: {$message}" . PHP_EOL;
    } catch (Exception $e) {
        echo "Error occured: {$e->getMessage()}" . PHP_EOL;
        throw $e;
    }
}
