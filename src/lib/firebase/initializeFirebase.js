import admin from 'firebase-admin';

/**
 * initialize firebase 
 */
const initializeFirebase = () => { // TODO: Needs to be moved to ENV 
    admin.initializeApp({
        credential: admin.credential.cert(
{
  "type": "service_account",
  "project_id": "ondc-2c3bf",
  "private_key_id": "6f2f24851315bb4daad9686b63fe545e29905ebe",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCpMkeKW+WxnTvx\nJKT6N2zYuLPqgEeV7ZBkjH4K1fyI/VO5IJ9jzwL5kPl9mY6u0NeyL0bYZ5EnbfD3\nEbRMqMqvvfupAVVmYfGqtSQMou/7tHJ5QCPdLkELRnpg/0EWN0+WguBzUM5U3Fee\njlnSUJ+a3Q+JXJIVLGevLASgNtEmwzGsnKxuSomiZGEFFkC8I7H14BQN4Loo3hjB\n10HRTqgfKUNtQDST3Mce3x40t2u1wYy+cDzVP2Be0Io5rDTqY6XST9B8/i6WzOAO\nk6kC6vG0CV6eV5XUuVeer2zX4WGE6G1uBCO9yRMJisqnTbZlqlJ/ie1YSEHidNce\nFAfqY2FDAgMBAAECggEAJbGqZ4QmrYW6i3Qe/xGnAbdQed9fU2MMJqJ4GCDpNHm/\nk8BVUi6V2pS2SImT1JV5YFyQ+3hDSdX/94MtuGBoW3PHY7UE2hza8q2NXPVV4q0m\nTaYA928tFX57mC11yiXDaOQ6beZkOVqneI79KtJEZIN4SSFi+C2e4dM8KpdbzDcW\nkWbIwAd0jtUERyHFtSjKhEwfgrt8WNV+WWBqp8iqDQcnwKWg/Gfttsdg/2BiFkvG\nGBIHDU7KsQ0IEBKPqWE57qw3h5HlCnJTMYIZESK5fUBGk78s8VZPuhqJhoe2IRQI\nE0anjVfL5QqYjl/+SWZTvhvRTIlso9U4z4ptimWD5QKBgQDVDCvkWpL23o2PhYsx\ntwkFxNvYAwRh4ajpA+BTjHs/LjxR4eqfyvh60LVtCFchVPnZDramPQLzkZ1YY09m\nxKogJLVHyy+uoWg/2Ohm1setgEV5m2x6zM6RkfVH80kf77AGehYXh18zPjztCdtt\nv/x70T5ECUQFflhINDUYWCpPnQKBgQDLTtvtUCArMo3VJsB+yhPC4yEvmtacJTH9\n/htUfIrJ2KELUnvI4Gfpix3wj8/AqCl4sD106BrCqqVha/4TXMqD/Ofc0OLoNSgS\nJ6wJlBbyZAEgBT70+VMbQYZq51NqkkxTkqGzUSewdMaZxOMyl3vLihHqeZoTSaWd\nwowmN8ZOXwKBgQCD2wmbRhdpJOp2Jk+00DSMVn893PgsYE57EMQY0XxB6Sq5/tmI\nVkWdNWjj92J9pasQlNOkZWRbPQcl+ijdUOB+DloH+hAjw4/S3DtR0qI4lofpMLFd\n+z3pyG0HP+JFGsJV79+WZlkcTOvGRPCCp2zrcOBZmWZ5A+49mdo2m/Jr3QKBgQCM\ndsRt9mDzV280qBxwvO7gRApmmITTxsL+Z/S773v4Lso9R1SsmZZRfcNGtCVmRwi4\nEJO1VLNAcaPnZjRZbk+g1zfekRdkNW2k9XHgAEfGWh+I3vb7S9MGTsQu0foI9GD1\nkKZVfKl+OYAJN0V9a7mlC5SLOk6gKs7Y61PnB7vj4wKBgCV6YAFfk4la/47Ay4PL\nLeUHN3+cw4//BwRRSZ/gHo2ZCO7g6nADsCVbgimYbzVDE08zd8rHVU4WCiXeQU8f\nzclGKeJod8Mox2UfeVFcgFisNXpKr1Qwh4WllAavJ9y+wyERg8Mqn3KPJsjmgRr5\n1HKC4CAyzF44TVsnaU3MbcmY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-qnktp@ondc-2c3bf.iam.gserviceaccount.com",
  "client_id": "118026170162446615855",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qnktp%40ondc-2c3bf.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
)
    });
}

export default initializeFirebase;