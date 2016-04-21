# Group Suppression List
<a name="suppression-list-api"></a>

A suppression list - or exclusion list, as it is sometimes called - stores a recipient's opt-out preferences. It is a list of recipient email addresses to which you do NOT want to send email. The Suppression List API is used to manage your customer-specific exclusion list entries.  An entry indicates whether the recipient requested to receive one of the following:

* Transactional and non-transactional messages from a given customer
* Transactional messages only from a given customer
* Non-transactional messages only from a given customer
* No messages from a given customer

Transactional messages are single recipient messages that are used operationally, e.g. to reset a password or confirm a purchase; while non-transactional messages are used to run email campaigns where a list of recipients are targeted, e.g. advertising a sales event.

In addition to the customer-specific exclusion list, Message Systems maintains a global suppression list across all customers.

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## List Entry Attributes
| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|transactional | boolean | Whether the recipient requested to not receive any transactional messages | At a minimum, transactional or non_transactional is required upon creation of the entry. | |
|non_transactional | boolean | Whether the recipient requested to not receive any non-transactional messages | At a minimum, transactional or non_transactional is required upon creation of the entry. |  |
|source | string | Source responsible for inserting the list entry. Valid values include: `FBL`, `List Unsubscribe`, `Bounce Rule`, `Unsubscribe Link`, `Manually Added`, `Compliance`| no - defaults to `Manually Added` on create | Field is read-only  |
|description | string | Short explanation of the suppression | no | |


## Bulk Insert/Update [/suppression-list/]

### Insert or Update List Entries [PUT]

Bulk insert or update entries in the customer-specific exclusion list by providing a JSON object, with a "recipients" key containing an array of recipients to insert or update, as the PUT request body. Maximum size of the JSON object is 50mb. At a minimum, each recipient must have a valid "email" address and at least one of the following keys: "transactional" or "non_transactional". The optional "description" key can be used to include an explanation of what type of message should be suppressed.

If the recipient entry was added to the list by Compliance, it cannot be updated.

If an email address is duplicated in a single request, only the first instance will be processed.

*Note:* `email`, which is an alias of `recipient`, attribute is supported but deprecated.

+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

        ```
        {
            "recipients": [
                {
                    "recipient": "rcpt_1@example.com",
                    "transactional": true,
                    "description": "User requested to not receive any transactional emails."
                },
                {
                    "recipient": "rcpt_2@example.com",
                    "non_transactional": true
                }
            ]
        }
        ```

+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "transactional must be a boolean if present"
                },
                {
                    "message": "Invalid email address: example.com"
                }
            ]
        }

+ Response 500 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Unable to update suppression list"
                }
            ]
        }

+ Response 200 (application/json; charset=utf-8)

        {
            "results" :
                {
                    "message": "Suppression List successfully updated"
                }
        }


## Search [/suppression-list{?to,from,types,sources,limit}]

### Search for List Entries [GET]

Perform a filtered search for entries in your customer-specific exclusion list.

+ Parameters
    + to = `now` (optional, datetime, `2014-07-20T09:00:00%2B0000`) ... Datetime the entries were last updated, in the format of YYYY-MM-DDTHH:mm:ssZ
    + from (optional, datetime, `2014-07-20T09:00:00%2B0000`) ... Datetime the entries were last updated, in the format YYYY-MM-DDTHH:mm:ssZ
    + types (optional, list) ... Types of entries to include in the search, i.e. entries with "transactional" and/or "non_transactional" keys set to true
    + sources (optional, list) ... Sources of the entries to include in the search, i.e. entries that were added by this source
    + limit (optional, int, `5`) ... Maximum number of results to return.  Must be between 1 and 100000. Default value is 100000.

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 500 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Unable to perform search"
                }
            ]
        }

+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "from must be a valid date"
                }
            ]
        }

+ Response 200 (application/json; charset=utf-8)

        {
            "results": [
                {
                    "recipient": "test@example.com",
                    "transactional": false,
                    "non_transactional": true,
                    "source": "Bounce Rule",
                    "description": "550: this email address does not exist #55",
                    "created": "2015-01-01T01:01:01+00:00",
                    "updated": "2015-01-01T01:01:01+00:00"
                }
            ]
        }


## Retrieve, Delete [/suppression-list/{recipient_email}]

### Retrieve a Recipient Suppression Status [GET]

Retrieve the suppression status for a specific recipient by specifying the recipient’s email address in the URI path.

If the recipient is not in the customer-specific exclusion list, an HTTP status of 404 is returned. If the recipient is in the list, an HTTP status of 200 is returned with the full suppression status in the response body.

In addition to the list entry attributes, the response body also includes "created" and "updated" timestamps.

+ Parameters
  + recipient_email (required, string, `rcpt_1@example.com`) ... Recipient email address


+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 404 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Recipient could not be found"
                }
            ]
        }

+ Response 200 (application/json; charset=utf-8)

        {
            "results" : [
              {
                "recipient" : "rcpt_1@example.com",
                "transactional" : false,
                "non_transactional" : true,
                "source" : "Manually Added"
                "description" : "User requested to not receive any non-transactional emails.",
                "created" : "2015-01-01T12:00:00.000Z'
                "updated" : "2015-01-01T12:00:00.000Z'
              }
            ]
        }

### Delete a List Entry [DELETE]

Delete a recipient from the list by specifying the recipient's email address in the URI path.

If the recipient is not in the customer-specific exclusion list, an HTTP status of 404 is returned. If the recipient is in the list, an HTTP status of 204 is returned indicating a successful deletion.

+ Parameters
    + recipient_email (required, string, `rcpt_1@example.com`) ... Recipient email address


+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 404 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Recipient could not be found"
                }
            ]
        }

+ Response 403 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Recipient could not be removed - Compliance"
                }
            ]
        }

+ Response 204 (application/json; charset=utf-8)

### Insert or Update a List Entry [PUT]

The PUT method on this endpoint has been removed in favor of the Bulk Insert/Update method.

+ Response 405 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Method Not Allowed"
                }
            ]
        }
