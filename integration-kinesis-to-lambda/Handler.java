package example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.StandardCharsets;


public class Handler implements RequestHandler<KinesisEvent, Void> {
    @Override
    public Void handleRequest(KinesisEvent event, Context context) {
        LambdaLogger logger = context.getLogger();
        if (event.getRecords().isEmpty()) {
            logger.log("Empty Kinesis Event received");
            return null;
        }
        for (KinesisEvent.KinesisEventRecord record : event.getRecords()) {
            try {
                logger.log("Processed Event with EventId: "+record.getEventID());
                String data = decodeRecordData(record.getKinesis().getData(),context);
                logger.log("Data:"+ data);
                // TODO: Do interesting work based on the new data
            }
            catch (Exception ex) {
                logger.log("An error occurred:"+ex.getMessage());
                throw ex;
            }
        }
        logger.log("Successfully processed:"+event.getRecords().size()+" records");
        return null;
    }

    private String decodeRecordData(ByteBuffer encodedData,Context context)  {
        // Create a CharsetDecoder object for the desired character set
        CharsetDecoder decoder = StandardCharsets.UTF_8.newDecoder();
        // Decode the ByteBuffer using the CharsetDecoder object
        String decodedData = null;
        try {
            CharBuffer charBuffer  = decoder.decode(encodedData);
            // Convert the decoded characters to a String
            decodedData = charBuffer.toString();
        } catch (CharacterCodingException characterCodingException) {
            context.getLogger().log("Error decoding data: " + characterCodingException.getMessage());
            throw new RuntimeException(characterCodingException);
        }

        return  decodedData;
    }
}
