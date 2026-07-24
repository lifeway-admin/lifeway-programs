import os
import boto3

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "")


def _client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def generate_presigned_post(key: str, content_type: str, max_size_bytes: int) -> dict:
    return _client().generate_presigned_post(
        Bucket=R2_BUCKET_NAME,
        Key=key,
        Fields={"Content-Type": content_type},
        Conditions=[{"Content-Type": content_type}, ["content-length-range", 1, max_size_bytes]],
        ExpiresIn=300,
    )


def generate_presigned_download_url(key: str, filename: str) -> str:
    return _client().generate_presigned_url(
        "get_object",
        Params={
            "Bucket": R2_BUCKET_NAME,
            "Key": key,
            "ResponseContentDisposition": f'attachment; filename="{filename}"',
        },
        ExpiresIn=300,
    )


def head_object(key: str) -> dict:
    return _client().head_object(Bucket=R2_BUCKET_NAME, Key=key)


def delete_object(key: str) -> None:
    _client().delete_object(Bucket=R2_BUCKET_NAME, Key=key)
