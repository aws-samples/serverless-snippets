<?php

# using bref/bref and bref/logger for simplicity

use Bref\Context\Context;
use Bref\Event\InvalidLambdaEvent;
use Bref\Event\Sqs\SqsEvent;
use Bref\Event\Sqs\SqsHandler;
use Bref\Logger\StderrLogger;

require __DIR__ . '/vendor/autoload.php';


class Handler extends SqsHandler
{
    private StderrLogger $logger;
    public function __construct(StderrLogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @param SqsEvent $event
     * @param Context $context
     * @return void
     * @throws InvalidLambdaEvent
     */
    public function handleSqs(SqsEvent $event, Context $context): void
    {
        try {
            foreach ($event->getRecords() as $record) {
                $body = $record->getBody();
                // TODO: Do interesting work based on the new message
            }
        } catch (InvalidLambdaEvent $e) {
            $this->logger->error($e->getMessage());
            throw $e;
        }
    }
}

$logger = new StderrLogger();
return new Handler($logger);
