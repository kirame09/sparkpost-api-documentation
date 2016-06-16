title: Subaccounts
description: Manage subaccounts, a way for service providers to provision and manage customers.

# Group Subaccounts
<a name="subaccounts-api"></a>
API for retrieving and managing subaccounts associated with your Master Account.
Subaccounts are a way for service providers to provision and manage their customers separately from each other and to provide assets and reporting data.
For more general information pertaining to subaccounts, please see the [Subaccounts Introduction](index.html#header-subaccounts)

## Subaccounts Collection [/subaccounts]

### List subaccounts [GET]

Endpoint for retrieving a list of your subaccounts. This endpoint only returns information about the subaccounts themselves, not the data associated with the subaccount.

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

        {
          "results": [
            {
              "id": 123,
              "name": "Joe's Garage",
              "status": "active",
              "ip_pool": "my_ip_pool",
              "compliance_status": "active"
            },
            {
              "id": 456,
              "name": "SharkPost",
              "status": "active",
              "compliance_status": "active"
            },
            {
              "id": 789,
              "name": "Dev Avocado",
              "status": "suspended",
              "compliance_status": "active"
            }
          ]
        }

### Create new subaccount [POST]

Provisions a new subaccount and an initial subaccount API key. Subaccount API keys are only allowed very specific grants, which are limited to: `smtp/inject`, `sending_domains/manage`, `tracking_domains/view`, `tracking_domains/manage`, `message_events/view`, `suppression_lists/manage`, `transmissions/view`, and `transmissions/modify`.

Subaccounts are allowed to send mail using the SMTP protocol or Transmissions API, retrieve sending statistics via the Message Events API, manage their Sending Domains, manage their Suppression List.

**Note: Stored recipients lists and stored templates are currently not supported for subaccounts sending mail using the Transmissions API.**

#### Request Body Attributes

| Field         | Required   | Type    | Description                                                               | Notes                                                                                                                                                         |
| ------------  | ---------- | ------- | --------------------------------------------------------------------------| ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name          | yes        | string  | User friendly identifier for a specific subaccount                        |                                                                                                                                                               |
| key_label     | yes        | string  | User friendly identifier for the initial subaccount api key               |                                                                                                                                                               |
| key_grants    | yes        | Array   | List of grants to give to the initial subaccount api key                  | Valid values are `smtp/inject`, `sending_domains/manage`, `tracking_domains/view`, `tracking_domains/manage`, `message_events/view`, `suppression_lists/manage`, `transmissions/view`, and `transmissions/modify` |
| key_valid_ips | no         | Array   | List of IP's that the initial subaccount api key can be used from         | If the supplied `key_valid_ips` is an empty array, the api key is usable by any IP address                                                                    |
| ip_pool       | no         | string  | The ID of the default IP Pool assigned to this subaccount's transmissions ( **Note:** SparkPost only ) | If the supplied `ip_pool` is an empty string or not present, no default `ip_pool` will be assigned                                                            |


+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

            {
              "name": "Sparkle Ponies",
              "key_label": "API Key for Sparkle Ponies Subaccount",
              "key_grants": ["smtp/inject", "sending_domains/manage", "message_events/view", "suppression_lists/manage", "tracking_domains/view", "tracking_domains/manage"]
            }

+ Response 200 (application/json)

        {
          "results": {
            "subaccount_id": 888,
            "key": "cf806c8c472562ab98ad5acac1d1b06cbd1fb438",
            "label": "API Key for Sparkle Ponies Subaccount",
            "short_key": "cf80"
          }
        }

+ Response 400 (application/json)

        {
          "errors": [
            {
              "message": "`name` is a required field",
              "param": "name",
              "value": null
            },
            {
              "message": "`key_label` is a required field",
              "param": "key_label",
              "value": null
            },
            {
              "message": "`key_grants` is a required field",
              "param": "key_grants",
              "value": null
            },
            {
              "message": "Invalid `key_grants value`. Supported values are: 'smtp/inject', 'sending_domains/manage', 'message_events/view', 'suppression_lists/manage'",
              "param": "key_grants",
              "value": null
            },
            {
              "message": "`key_valid_ips` must be an Array",
              "param": "key_valid_ips",
              "value": null
            },
            {
              "message": "`key_valid_ips` must have valid netmask values",
              "param": "key_valid_ips",
              "value": null
            },
            {
              "message": "ip_pool must be 20 characters or less",
              "param": "ip_pool",
              "value": "an_ip_pool_name_that_is_too_long"
            },
            {
              "message": "ip_pool must be alphanumeric and underscore",
              "param": "ip_pool",
              "value": "$invalid chars"
            }
          ]
        }

## Subaccounts Entity [/subaccounts/{subaccount_id}]

### List specific subaccount [GET]

Endpoint for retrieving information about a specific subaccount.

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Parameters

    + subaccount_id (required, integer, `123`) ... Identifier of subaccount

+ Response 200 (application/json)

            {
              "results": {
                "id": 123,
                "name": "Joes Garage",
                "status": "active",
                "compliance_status": "active",
                "ip_pool": "assigned_ip_pool"
              }
            }

### Edit a subaccount [PUT]
Update an existing subaccount's information. You can update the following information associated with a subaccount:

#### Request Body Attributes

| Field   | Required   | Type   | Description                                        | Notes |
| ------- | ---------- | ------ | -------------------------------------------------- | ----- |
| name    | no         | string | User friendly identifier for a specific subaccount |       |
| status  | no         | string | Status of the account                              | Value is one of `active`, `suspended`, or `terminated` |
| ip_pool | no         | string | The ID of the default IP Pool assigned to this subaccount's transmissions | If the supplied `ip_pool` is an empty string, it will clear any currently specified `ip_pool` |

+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

            {
              "name": "Hey Joe! Garage and Parts",
              "status": "suspended"
            }

+ Parameters

    + subaccountID (required, integer, `123`) ... Identifier of subaccount

+ Response 200 (application/json)

            {
              "results": {
                "message": "Successfully updated subaccount information"
              }
            }

+ Response 400 (application/json)

        {
          "errors": [
            {
              "message": "ip_pool must be 20 characters or less",
              "param": "ip_pool",
              "value": "an_ip_pool_name_that_is_too_long"
            }
          ]
        }
