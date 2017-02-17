title: AB Testing
description: AB Testing of templates.

# Group AB Testing

**Note: This endpoint is available in SparkPost only**

#### AB Test Properties

| Property   | Type    | Description | Notes |
|------------|---------|-------------|-------|
| completed | boolean | Whether the AB Test has completed| |
| id | string | AB Test ID | |
| created_time | integer | Unix Timestamp of AB Test Creation | |
| expiration_time | integer | Unix Timestamp of AB Test Expiration when the test will complete and send to the remaining recipients with the winning template | |
| completed_time | integer | Unix Timestamp of when the test was completed | |
| duration_hours | integer | Number of hours the test should gather metrics for before selecting a winning template | Maximum duration is 1 week (168 hours) |
| recipient_list | string | Unique id of the recipient list to be used for the test |  |
| groups | JSON Array | Array of JSON Objects each containing a unique template_id and number of recipients to send to (size) |  example: `{"size": 1, "template_id": "my-first-email"}` |
| template_id | string | Unique id of a template to be used for the test |  |
| number_remaining_recipients | integer | Number of remaining recipients that will be sent to once the winning template has been determined | |


## AB Tests [/labs/ab-testing{?completed}]

## Create an AB Test [POST]

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

  + Body

        ```json
        {
            "duration_hours": 1,
            "recipient_list": "unique_id_4_graduate_students_list",
            "groups": [
                {"size": 1, "template_id": "my-first-email"},
                {"size": 1, "template_id": "my-second-email"}
                ]
            }
        ```
        
+ Response 200 (application/json)
    
    ```json
    {
      "results": {
          "duration_hours": 1,
          "recipient_list": "unique_id_4_graduate_students_list",
          "groups": [
            {
              "template_id": "my-first-email",
              "recipients": [
                "recip1@sparkpost.com"
              ]
            },
            {
              "template_id": "my-second-email",
              "recipients": [
                "recip2@sparkpost.com"
              ]
            }
          ],
          "test_id": "23250830-efd9-11e6-98a7-000000000000",
          "expiration_time": 1486768705,
          "campaign_id": "ab_test_23250830-efd9-11e6-98a7-000000000000",
          "number_remaining_recipients": 3
      }
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "template_ids must be unique"}]
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Published Template ID could not be found"}]
    }
    ```

+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Published Template ID is not enabled for engagement tracking"}]
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Number of groups must be in range [2, 10]"}]
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "duration_hours must be in range [1, 168]"}]
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Post body contains invalid or malformed group(s)"}]
    }
    ```

+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Recipient List could not be found"}]
    }
    ```
    
+ Response 400 (application/json)

    ```json
    {
        "errors": [{"message": "Recipient List must be less than 2,000 entries"}]
    }
    ```

## List AB Tests [GET]


+ Request

    + Headers

            Authorization: aHR0cDovL2kuaW1ndXIuY29tL293UndTR3AucG5n
            Accept: application/json
+ Parameters

  + id (required, string, `23250830-efd9-11e6-98a7-000000000000`) ... AB Test ID
  + completed (optional, boolean, `true`) ... If set to true, return only completed AB Tests. If set to false, return only uncompleted AB Tests.
                                                If not specified, return all AB Tests.
                                                
+ Response 200 (application/json)

    ```json
    {
        "results": [{
          "completed": true,
          "completed_time": 1486766275,
          "id": "23250830-efd9-11e6-98a7-000000000000",
          "created_time": 1486762656,
          "expiration_time": 1486766255
        }, {
          "completed": true,
          "completed_time": 1486747730,
          "id": "23250830-efd9-11e6-98a7-000000000001",
          "created_time": 1486747711,
          "expiration_time": 1486747711
        }]
    }
    ```

## AB Tests Resource [/labs/ab-testing/{id}]

## Get an AB Test [GET]

Retrieves a specific AB Test.

+ Request

    + Headers

            AUTHORIZATION: aHR0cDovL2kuaW1ndXIuY29tL293UndTR3AucG5n
            Accept: application/json

+ Parameters

  + id (required, string, `23250830-efd9-11e6-98a7-000000000000`) ... AB Test ID


+ Response 200 (application/json)

    ```json
    {
        "results": {
          "completed": true,
          "completed_time": 1486747802,
          "winning_template": "my-first-email",
          "remaining_recipients": [
            "recip1@sparkpost.com",
            "recip3@sparkpost.com",
            "recip5@sparkpost.com"
          ],
          "expiration_time": 1486747711,
          "campaign_id": "ab_test_23250830-efd9-11e6-98a7-000000000000",
          "id": "23250830-efd9-11e6-98a7-000000000000",
          "sample_recipients": [
            {
              "recipients": [
                "recip2@sparkpost.com"
              ],
              "template_id": "my-first-email"
            },
            {
              "recipients": [
                "recip4@sparkpost.com"
              ],
              "template_id": "my-second-email"
            }
          ],
          "created_time": 1486747711
        }
    }

    ```
    
+ Response 404 (application/json)

    ```json
    {
        "errors": [{"message": "Resource could not be found"}]
    }
    ```
