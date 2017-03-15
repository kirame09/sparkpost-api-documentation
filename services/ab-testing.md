title: A/B Testing
description: A/B Testing of templates.

# Group A/B Testing

<div class="alert alert-info"><strong>Note</strong>: This endpoint is available in SparkPost only</div>

<a name="ab-testing-api"></a>

An A/B test is a method of comparing templates to see which one performs better. You provide a range of templates (2-10), a recipient list (less than 2,000 entries), a sample size, and a test duration to begin. When the test time has expired, the template with the best conversion rate wins. All remaining recipients will be sent the winning template. The A/B Testing API provides the means to create new tests, and view completed results. 

#### A/B Test Properties

| Property   | Type    | Description | Notes |
|------------|---------|-------------|-------|
| completed | boolean | Whether the A/B Test has completed| |
| id | string | A/B Test ID | |
| created_time | integer | Unix Timestamp of A/B Test Creation | |
| expiration_time | integer | Unix Timestamp of A/B Test Expiration when the test will complete and send to the remaining recipients with the winning template | |
| completed_time | integer | Unix Timestamp of when the test was completed | |
| duration_hours | integer | Number of hours the test should gather metrics for before selecting a winning template | Maximum duration is 1 week (168 hours) |
| recipient_list | string | Unique id of the recipient list to be used for the test | Recipient list must contain less than 2,000 entries |
| groups | JSON Array | Array of JSON Objects each containing a unique template_id and number of recipients to send to (size) |  example: `{"size": 1, "template_id": "my-first-email"}` |
| number_remaining_recipients | integer | Number of remaining recipients that will be sent to once the winning template has been determined | |
| remaining_recipients | array of strings | List of recipients that will be sent to once the winning template has been determined | |


## A/B Tests [/labs/ab-testing{?completed}]

## Create an A/B Test [POST]

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

## List A/B Tests [GET]


+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json
+ Parameters

  + completed (optional, boolean, `true`) ... If set to true, return only completed A/B Tests. If set to false, return only uncompleted A/B Tests.
                                                If not specified, return all A/B Tests.
                                                
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

## A/B Tests Resource [/labs/ab-testing/{id}]

## Get an A/B Test [GET]

Retrieves a specific A/B Test.

+ Request

    + Headers

            AUTHORIZATION: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Parameters

  + id (required, string, `23250830-efd9-11e6-98a7-000000000000`) ... A/B Test ID


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
