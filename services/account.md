title: Account
description: Get your SparkPost account information, including subscription status and quota usage.

# Group Account

<div class="alert alert-info"><strong>Note:</strong> This endpoint is not available on SparkPost Enterprise.</div>


## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## Retrieve [/account{?include}]

### Retrieve account information [GET]

Get your SparkPost account information, including subscription status and quota usage.

#### Account Properties

| Property   | Type    | Description | Notes |
|------------|---------|-------------|-------|
| company_name | string | Account holder company name | |
| country_code | string | Account holder 2-letter country code | |
| anniversary_date | string | ISO date of billing anniversary | |
| created | string | ISO date account was created | |
| updated | string | ISO date account details were last updated | |
| status | string | account status - `active` | |
| subscription | object | current subscription details | (see [Subscription Properties](#header-subscription-properties) section) |
| pending_subscription | object | pending subscription details | (see [Subscription Properties](#header-subscription-properties) section) |
| options | object | account-level tracking settings | (see [Options Properties](#header-options-properties) section) |
| usage | object | account quota usage details | Specify 'include=usage' in query string to include usage info (see [Usage Properties](#header-usage-properties) section) |

#### Subscription Properties

| Property   | Type    | Description |
|------------|---------|-------------|
| code       | string  | Code of the plan |
| name       | string  | Name of the plan |
| effective_date | string | ISO date of when this subscription has been or will be effective |
| self_serve | boolean | `true` if the subscription can be managed through the UI |

#### Options Properties

| Property   | Type    | Description |
|------------|---------|-------------|
| smtp_tracking_default | boolean  | account-level default for SMTP engagement tracking |
| rest_tracking_default | boolean  | account-level default for REST API engagement tracking |

#### Usage Properties

| Property   | Type    | Description | Notes |
|------------|---------|-------------|-------|
| timestamp | string | ISO date usage data was retrieved | |
| day | object | daily usage report | See [Daily/Monthly Usage Properties](#header-daily-monthly-usage-properties) section |
| month | object | monthly usage report | See [Daily/Monthly Usage Properties](#header-daily-monthly-usage-properties) section |

#### Daily/Monthly Usage Properties

| Property   | Type    | Description |
|------------|---------|-------------|
| used | number | total messages sent in this period |
| limit | number | total allowance for this period |
| start | string | ISO date when this period started |
| end | string | ISO date when this period ends |

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Parameters

  + include (optional, `usage`, string) ... Additional parts of account details to include. Multiple parts can be specified in a comma separated list. The only valid value is currently `usage` and by default the `usage` details are not included.


+ Response 200 (application/json)

        {
            "results" : {
                "company_name": "Example Inc",
                "country_code": "US",
                "anniversary_date": "2015-01-11T08:00:00.000Z",
                "created": "2015-01-11T08:00:00.000Z",
                "updated": "2015-02-11T08:00:00.000Z",
                "status": "active",
                "subscription": {
                    "code": "bronze1",
                    "name": "Bronze",
                    "plan_volume": 10000,
                    "self_serve": "true"
                },
                "pending_subscription": {
                    "code": "gold1",
                    "name": "Gold",
                    "effective_date": "2015-04-11T00:00:00.000Z"
                },
                "options": {
                    "smtp_tracking_default": false
                },
                "usage": {
                    "timestamp": "2016-03-17T05:19:00.932Z",
                    "day": {
                        "used": 22003,
                        "limit": 50000,
                        "start": "2016-03-16T05:30:00.932Z",
                        "end": "2016-03-17T05:30:00.932Z"
                    },
                    "month": {
                        "used": 122596,
                        "limit": 1500000,
                        "start": "2016-03-11T08:00:00.000Z",
                        "end": "2016-04-11T08:00:00.000Z"
                    }
                }
            }
        }

## Update [/account]

### Update account information [PUT]

Update your SparkPost account information and account-level options.

#### Request Body Attributes

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| company_name | string | company name | no |
| options | object | account-level options (see [Options Properties](#header-options-properties) section) | no |

#### Options Properties

| Property   | Type    | Description |
|------------|---------|-------------|
| smtp_tracking_default | boolean  | set to `true` to turn on SMTP engagement tracking by default |
| rest_tracking_default | boolean  | set to `false` to turn off REST API engagement tracking by default |
| transactional_unsub   | boolean  | set to `true` to include `List-Unsubscribe` header for all transactional messages by default |
| transactional_default | boolean  | set to `true` to send messages as transactional by default |

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

    + Body

            {
                "company_name": "SparkPost",
                "options": {
                  "smtp_tracking_default": true
                }
            }

+ Response 200 (application/json)

        {
            "results": {
                "message": "Account has been updated"
            }
        }

+ Response 400 (application/json)

        {
          "errors": [
            {
              "message": "Incorrect type, expected boolean",
              "param": "smtp_tracking_default",
              "value": "bad value"
            }
          ]
        }

+ Response 500 (application/json)

        {
            "errors" : [
                {
                    "message" : "Cannot update Account"
                }
            ]
        }
