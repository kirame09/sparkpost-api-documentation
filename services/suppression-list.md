title: Suppression List
description: Manage your suppression list - a list of recipient email addresses to which you do NOT want to send email.

# Group Suppression List
<a name="suppression-list-api"></a>

A suppression list - or exclusion list, as it is sometimes called - stores a recipient's opt-out preferences. It is a list of recipient email addresses to which you do NOT want to send email. The Suppression List API is used to manage your exclusion list entries.  An entry indicates whether the recipient opted out of receiving one of the following:

* Transactional messages
* Non-transactional messages

Transactional messages are single recipient messages that are used operationally, e.g. to reset a password or confirm a purchase; while non-transactional messages are used to run email campaigns where a list of recipients are targeted, e.g. advertising a sales event.

In addition to your suppression list, SparkPost maintains a global suppression list across all customers.

## Recipient Database Maintenance

**When initially configuring your SparkPost account, we *strongly recommend* you import any suppression list you have from any previous service to avoid incorrectly sending mail to unsubscribed/invalid recipients.**

**SparkPost supports bulk importing or manually adding up to 1,000,000 suppression list entries.**

It is also good practice to maintain your own recipient database by unsubscribing or removing recipients based on the bounce, unsubscribe and spam complaint events provided by SparkPost. These events are available from [webhooks](webhooks), [message events](message-events) and your suppression list. A 24-hour time-windowed suppression list search [as outlined below](#suppression-list-search-get) is useful here.

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## List Entry Attributes
| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
| recipient | string | Email address to be suppressed | yes | |
| type | string | Type of suppression record: "transactional" or "non_transactional" |  |
|transactional | boolean | Whether the recipient requested to not receive any transactional messages | Not required if a valid `type` is passed | Available, but deprecated in favor of `type`|
|non_transactional | boolean | Whether the recipient requested to not receive any non-transactional messages | Not required if a valid `type` is passed | Available, but deprecated in favor of `type` |
|source | string | Source responsible for inserting the list entry. Valid values include: `Spam Complaint`, `List Unsubscribe`, `Bounce Rule`, `Unsubscribe Link`, `Manually Added`, `Compliance`| no - entries created by the user are marked as `Manually Added` | Field is read-only  |
| description | string | Short explanation of the suppression | no | |


## Bulk Insert/Update [/suppression-list/]

### Insert or Update List Entries [PUT]

Bulk insert or update entries in the suppression list by providing a JSON object, with a "recipients" key containing an array of recipients to insert or update, as the PUT request body. Maximum size of the JSON object is 50mb. At a minimum, each recipient must have a valid email address and a suppression type: "transactional" or "non_transactional". The optional "description" key can be used to include an explanation of what type of message should be suppressed.

If the recipient entry was added to the list by Compliance, it cannot be updated.

If an email address is duplicated in a single request, only the first instance will be processed.

Please note that in the unlikely scenario where your receive a HTTP 5xx level error response while bulk loading, that some of your suppression entries may have been
successfully inserted or updated. If this occurs, please re-submit your original request again for processing.

*Note:* `email`, which is an alias of `recipient`, attribute is supported but deprecated.
*Note:* `transactional` and `non_transactional`, attributes are supported but deprecated. Please use type instead.


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
                    "type": "transactional",
                    "description": "User requested to not receive any transactional emails."
                },
                {
                    "recipient": "rcpt_2@example.com",
                    "non_transactional": true,
                    "type": "non_transactional",
                    "description": "User requested to not receive any non-transactional emails."
                }
            ]
        }
        ```

+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "PUT body contains 2 invalid or malformed recipient(s): rcpt_1@example.com, rcpt_2@example.com"
                }
            ]
        }

+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Type must be one of: \'transactional\', \'non_transactional\'"
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

## Search [/suppression-list{?to,from,domain,cursor,limit,per_page,page,sources,types,description}]

### Search for List Entries [GET]

Perform a filtered search for entries in your suppression list.

+ Parameters
    + to = `now` (optional, datetime, `2014-07-21T09:00:00-0400`) ... Datetime the entries were last updated, in the format of YYYY-MM-DDTHH:mm:ssZ
    + from (optional, datetime, `2014-07-20T09:00:00-0400`) ... Datetime the entries were last updated, in the format YYYY-MM-DDTHH:mm:ssZ
    + domain (optional, string, `yahoo.com`) ... Domain of entries to include in the search. ( **Note:** SparkPost only)
    + cursor (optional, string, `initial`) ... The results cursor location to return, to start paging with cursor, use the value of 'initial'. When cursor is provided the `page` parameter is ignored. ( **Note:** SparkPost only)
    + limit (optional, int, `5`) ... Maximum number of results to return per page.  Must be between 1 and 10,000. ( **Note:** SparkPost only)
    + per_page (optional, int, `5`) ... Maximum number of results to return per page.  Must be between 1 and 10,000. Default value is 1000. ( **Note:** SparkPost only)
    + page (optional, int, `5`) ... The results page number to return. Used with per_page for paging through results. The page parameter works up to 10,000 results. You must use the cursor parameter and start with cursor=initial to page result sets larger than 10,000 ( **Note:** SparkPost only)
    + sources (optional, list, `Bounce%20Rule,Manually%20Added`) ... Sources of the entries to include in the search, i.e. entries that were added by this source
    + types (optional, list, `transactional`) ... Types of entries to include in the search, i.e. entries that are "transactional" or "non_transactional"
    + description (optional, string, `Invalid%20Recipient`) ... Description of the entries to include in the search, i.e descriptions that include the text submitted. ( **Note:** SparkPost only)

    *Note:* `limit` parameter is supported up to 10000, but deprecated. Please use `per_page` instead.

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
                    "source": "Bounce Rule",
                    "type": "transactional",
                    "created": "2015-01-01T01:01:01+00:00",
                    "updated": "2015-01-01T01:01:01+00:00",
                    "transactional": true
                },
                {
                    "recipient": "test@example.com",
                    "description": "550: this email address does not exist #55",
                    "source": "Bounce Rule",
                    "type": "non_transactional",
                    "created": "2015-01-01T01:01:01+00:00",
                    "updated": "2015-01-01T01:01:01+00:00",
                    "non_transactional": true
                },
                {
                    "recipient": "test2@example.com",
                    "description": "Recipient unsubscribed",
                    "source": "Manually Added",
                    "type": "transactional",
                    "created": "2015-01-01T01:01:01+00:00",
                    "updated": "2015-01-01T01:01:01+00:00",
                    "transactional": true
                }
            ],
            "links": [],
            "total_count": 3
        }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
                "results": [
                    {
                        "recipient": "test@example.com",
                        "non_transactional": true,
                        "type": "non_transactional",
                        "source": "Bounce Rule",
                        "description": "550: this email address does not exist #55",
                        "created": "2015-01-01T01:01:01+00:00",
                        "updated": "2015-01-01T01:01:01+00:00"
                    },
                    {
                        "recipient": "test@example.com",
                        "transactional": true,
                        "type": "transactional",
                        "source": "Bounce Rule",
                        "description": "550: this email address does not exist #55",
                        "created": "2015-01-01T01:01:01+00:00",
                        "updated": "2015-01-01T01:01:01+00:00"
                    }
                ]
            }

## Retrieve, Delete, Insert or Update [/suppression-list/{recipient_email}]

### Retrieve a Recipient Suppression Status [GET]

Retrieve the suppression status for a specific recipient by specifying the recipient’s email address in the URI path.

If the recipient is not in the suppression list, an HTTP status of 404 is returned. If the recipient is in the list, an HTTP status of 200 is returned with the suppression records in the response body. Specifying the "type" key in the request body allows for retrieving only the "transactional" or "non_transactional" record. If type is specified and the recipient isn't suppressed for that type, an HTTP status of 404 is returned.

In addition to the list entry attributes, the response body also includes "created" and "updated" timestamps.

+ Parameters
  + recipient_email (required, string, `rcpt@example.com`) ... Recipient email address


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
                "transactional" : true,
                "non_transactional" : true,
                "source" : "Manually Added",
                "description" : "User requested to not receive any further emails.",
                "created" : "2015-01-01T12:00:00+00:00",
                "updated" : "2015-01-01T12:00:00+00:00"
              }
            ]
        }

+ Response 200 (application/json; charset=utf-8)

    + Body

        {
            "results" : [
              {
                "recipient" : "rcpt_1@example.com",
                "non_transactional" : true,
                "type": "non_transactional",
                "source" : "Manually Added",
                "description" : "User requested to not receive any non-transactional emails.",
                "created" : "2015-01-01T12:00:00+00:00",
                "updated" : "2015-01-01T12:00:00+00:00"
              },
              {
                "recipient" : "rcpt_1@example.com",
                "transactional" : true,
                "type": "transactional",
                "source" : "Manually Added",
                "description" : "User requested to not receive any further emails.",
                "created" : "2015-01-01T12:00:00+00:00",
                "updated" : "2015-01-01T12:00:00+00:00"
              }
            ],
            "links": [],
            "total_count": 2
        }



### Delete a List Entry [DELETE]

Delete a recipient from the list by specifying the recipient's email address in the URI path.

If the recipient is not in the suppression list, an HTTP status of 404 is returned. If the recipient is in the list, an HTTP status of 204 is returned indicating a successful deletion. Suppression "type" can be specified in the request body. If a type isn't provided, the suppression will be deleted for both transactional and non-transactional.

+ Parameters
    + recipient_email (required, string, `rcpt@example.com`) ... Recipient email address

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

**Note:** SparkPost only

Insert or update a single entry in the suppression list by providing a JSON object. At a minimum, the JSON object should include a suppression type: "transactional" or "non_transactional". The optional "description" key can be used to include an explanation of what type of message should be suppressed.

If the recipient entry was added to the list by Compliance, it cannot be updated.

+ Parameters
    + recipient_email (required, string, `rcpt@example.com`) ... Recipient email address

+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

        ```
        {
	        "type": "transactional",
	        "description" : "Unsubscribe from newsletter"
        }
        ```

+ Response 200 (application/json; charset=utf-8)

        {
              "results": {
                "message": "Suppression list successfully updated"
              }
        }
+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Must supply a suppression type"
                }
            ]
        }
+ Response 400 (application/json; charset=utf-8)

        {
            "errors": [
                {
                    "message": "Type must be one of: \'transactional\', \'non_transactional\'"
                }
            ]
        }
