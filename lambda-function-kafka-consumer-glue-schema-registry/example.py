import boto3
import avro.io
from uuid import UUID
from datetime import datetime
import base64
import json
import io

print('Loading function')

glue_client = boto3.client('glue')
s3_client = boto3.client('s3')
# memory cache for the inline schemas
schema_map = {}

def get_schema(schema_version_id):
    print("loading schema for version: " + schema_version_id)

    response = glue_client.get_schema_version(
        SchemaVersionId=schema_version_id
    )

    return response['SchemaDefinition']

def gsr_value_deserializer(raw_record):
    # First two control bytes are put by Glue Schema Registry serializer.
    # control_byte = raw_record[0]
    # compression_byte = raw_record[1]

    # version to deserialize each record.
    version_bytes = raw_record[2:18]
    schema_version = UUID(bytes=version_bytes)
    schema_key = str(schema_version)
    # print(schema_version)
    
    if schema_key in schema_map:
        schema_inline = schema_map[schema_key]
    else:
        schema_inline = get_schema(schema_key)
        schema_map[schema_key] = schema_inline

    # raw data record begins after byte #18
    raw_record = raw_record[18:]
    schema = avro.schema.parse(schema_inline)
    reader = avro.io.DatumReader(schema)

    bytes_reader = io.BytesIO(raw_record)

    decoder = avro.io.BinaryDecoder(bytes_reader)
    msg = reader.read(decoder)
    return msg


def lambda_handler(event, context):
    
    # use time based file partitioning in S3
    current_month = datetime.now().strftime('%m')
    current_day = datetime.now().strftime('%d') 
    current_year_full = datetime.now().strftime('%Y')
    current_hour = datetime.now().strftime('%H')
    current_minute = datetime.now().strftime('%M')
    ct = datetime.now()

    records = event['records']
    messageAr = []
    for key in records:
        base64records = event['records'][key]
        raw_records = [base64.b64decode(x["value"]) for x in base64records]
        
        for raw_record in raw_records:
            record = gsr_value_deserializer(raw_record)
            messageAr.append(record)
            
    s3_client.put_object(Body=json.dumps(messageAr), Bucket='<Your S3 Bucket>', Key='<your s3 prefix>/year=' + current_year_full + '/month=' + current_month + '/day=' + current_day + '/hour=' + current_hour + '/minute=' + current_minute + '/file-' + str(ct) + '.json')
            
    return {
        'statusCode': 200,
        'body': json.dumps('Finished processing!')
    }