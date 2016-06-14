# Group Sending IPs

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

#### Sending IP Properties

| Property   | Type    | Description | Notes |
|------------|---------|-------------|-------|
| external_ip | string | Public-facing IP address of this sending IP | |
| hostname | string | Reverse DNS hostname associated with this IP | |
| ip_pool | string | IP pool this sending IP is held in | |

## Sending IPs [/sending-ips]

## Get all sending IPs [GET]

Gets all IP addresses.

+ Request

    + Headers

            Authorization: aHR0cDovL2kuaW1ndXIuY29tL293UndTR3AucG5n
            Accept: application/json

+ Response 200 (application/json)

    ```json
    {
        "results": [{
          "external_ip": "123.456.789.123",
          "hostname": "mta472a.sparkpostmail.com",
          "ip_pool": "marketing"
        }, {
          "external_ip": "123.456.789.124",
          "hostname": "mta474a.sparkpostmail.com",
          "ip_pool": "default"
        }]
    }
    ```

## Sending IP Resource [/sending-ips/{external_ip}]

## Get a Sending IP [GET]

Retrieves a specific sending IP.

+ Request

    + Headers

            AUTHORIZATION: aHR0cDovL2kuaW1ndXIuY29tL293UndTR3AucG5n
            Accept: application/json

+ Parameters

  + external_ip (required, string, `123.456.789.012`) ... The external IP of the sending IP


+ Response 200 (application/json)

    ```json
    {
        "results": {
          "external_ip": "123.456.789.012",
          "hostname": "mta472a.sparkpostmail.com",
          "ip_pool": "cool_kids"
        }
    }

    ```

+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "external ip must be a valid IPv4 address"}]
    }
    ```

+ Response 404 (application/json)

    ```json
    {
        "errors": [{"message": "Sending IP does not exist"}]
    }
    ```

## Update a Sending IP [PUT]

Updates the IP Pool of a sending IP.

#### Request Body Attributes

| Field          | Type           | Description                                | Required      |
|----------------|----------------|--------------------------------------------|---------------|
| ip_pool        | string         | The IP pool to add this sending IP to.     | yes           |


+ Request

    + Headers

            AUTHORIZATION: aHR0cDovL2kuaW1ndXIuY29tL293UndTR3AucG5n
            Accept: application/json

    + Body

            {
                "ip_pool": "too_cool_for_pool"
            }

+ Parameters

  + external_ip (required, string, `123.456.789.012`) ... The external IP of the sending IP to update


+ Response 200 (application/json)

    ```json
    {
        "results": {
          "message": "Updated IP Pool."
        }
    }
    ```

+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "IP Pool glibglob does not exist."}]
    }
    ```

+ Response 404 (application/json)

    ```json
    {
        "errors": [{"message": "Sending IP does not exist"}]
    }
    ```
