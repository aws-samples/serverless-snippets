import base64
import json
import boto3
def lambda_handler(event, context):
    kinesis = boto3.client('kinesis')
    for record in event['Records']:
        try:
            print(f"Processed Kinesis Event - EventID: {record['eventID']}")
            record_data = get_record_data(record['kinesis'])
            print(f"Record Data: {record_data}")
            # TODO: Do interesting work based on the new data
        except Exception as e:
            print(f"An error occurred {e}")
            raise e
    print(f"Successfully processed {len(event['Records'])} records.")
def get_record_data(payload):
    data = base64.b64decode(payload['data']).decode('utf-8')
    # Placeholder for actual async work, you can use asyncio or threading for that
    return data