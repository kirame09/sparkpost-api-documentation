# Group Account

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## Account [/account{?include}]

## Get your account information [GET]

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
| subscription | object | current subscription details | (see *Subscription Properties* section) |
| pending_subscription | object | pending subscription details | (see *Subscription Properties* section) |
| options | object | account-level tracking settings | (see *Options Properties* section) |
| usage | object | account quota usage details | Specify 'include=usage' in query string to include usage info (see *Usage Properties* section) |

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
| day | object | daily usage report | See *Daily/Monthly Usage Properties* section |
| month | object | monthly usage report | See *Daily/Monthly Usage Properties* section |

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
