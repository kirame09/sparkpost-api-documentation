# Group Bounce Domains
<a name="bounce-domains-api"></a>

**Note:** The Bounce Domains API is available for SparkPost only.

Bounce domains are used to report bounces, emails that were rejected from the recipient server.  By adding a custom bounce domain to your account, you can customize the address that is used for the Return Path header (which denotes the destination for out of band bounces). This custom bounce domain overrides the default Return-Path (also known as the envelope FROM) value of "sparkpostmail.com" for all messages sent.

**Note:** Use of a bounce domain requires modification of your DNS records to include a CNAME record.

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## Bounce Domains Attributes

| Field   | Type   | Description | Required | Notes |
|------------|--------|-------------|----------|-------|
| domain | string | Name of the bounce domain | yes | Example: `example.domain.com` |
| status | JSON object| JSON object containing status details, including whether this domain's ownership has been verified  | no | Read only. For a full description, see the Status Attributes.|

### Status Attributes

Detailed status for this bounce domain is described in a JSON object with the following fields:

| Field         | Type     | Description                           | Default   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
| verified | boolean | Whether domain has been verified | false | Read only. This field will return "true" if cname_status is "valid".|
| cname_status | string | Verification status of CNAME configuration | unverified | Read only. Valid values are "unverified", "pending", "invalid" or "valid".|
| compliance_status | string | Compliance status | | Valid values are "pending", "valid", or "blocked".|

## Create and List [/bounce-domains]

### Create a Bounce Domain [POST]

Create a Bounce Domain.

+ Request (application/json)

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

            {
              "domain": "example.domain.com"
            }

+ Response 200

  + Body

            {
              "results": {
                "domain": "example.domain.com"
              }
            }

+ Response 400 (application/json)

  + Body

            {
              "errors" : [
                {
                  "code" : "8000",
                  "message" : "only one bounce domain can be created",
                  "description" : "Can't create more than one bounce domain."
                }
              ]
            }

+ Response 400 (application/json)

  + Body

            {
              "errors" : [
                {
                  "code" : "7000",
                  "message" : "restricted domain",
                  "description" : "Please contact us at support@sparkpost.com to get this domain authorized for your account."
                }
              ]
            }

+ Response 409 (application/json)

  + Body

            {
              "errors" : [
                {
                  "code" : "1602",
                  "message" : "resource conflict",
                  "description" : "A bounce domain with similar attributes already exists."
                }
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1300",
                  "message": "invalid data format/type",
                  "description": "Error validating domain name syntax for domain: 'example..domain.com'"
                }
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1300",
                  "message": "invalid data format/type",
                  "description": "Error domain name length too short for domain: 'ex'"
                } 
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1300",
                  "message": "invalid data format/type",
                  "description": "Error domain name contains no '.'(s) for domain: 'exampledomaincom'"
                }
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1300",
                  "message": "invalid data format/type",
                  "description": "Error domain name contains invalid characters or spaces for domain: 'example*&#.domain.com'"
                }
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1400",
                  "message": "required field is missing",
                  "description": "Missing required field: (domain) is required"
                }
              ]
            }


### List Bounce Domains [GET]

Retrieve a list of all bounce domains.

**NOTE:** Only one custom bounce domain is permitted per account at this time.

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

  + Body

            {
              "results": [
                {
                  "domain": "example.domain.com",
                  "status": {
                    "verified": false,
                    "cname_status": "pending",
                    "compliance_status": "pending"
                  }
                } 
              ]
            }


## Retrieve and Delete [/bounce-domains/{domain}]

### Retrieve a Bounce Domain [GET]

Retrieve an existing bounce domain.

+ Parameters
  + domain (required, string, `example.domain.com`) ... domain name


+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

  + Body

            {
              "results": {
                "domain": "example.domain.com",
                "status": {
                  "verified": false,
                  "cname_status": "pending",
                  "compliance_status": "valid"
                }
              }
            }

+ Response 404 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "8001",
                  "message": "bounce domain does not exist",
                  "description": "Resource not found: example.domain.com"
                }
              ]
            }


### Delete a Bounce Domain [DELETE]

Delete an existing bounce domain.

+ Parameters
  + domain (required, string, `example.domain.com`) ... domain name

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

+ Response 204

+ Response 404 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "8001",
                  "message": "bounce domain does not exist",
                  "description": "Resource not found: example.domain.com"
                }
              ]
            }


## Verify [/bounce-domains/{domain}/verify]

### Verify a Bounce Domain [POST]
Initiate a check against the CNAME DNS record for the specified bounce domain. The domain's `status` object is returned on success.

+ Parameters
  + domain (required, string, `example.domain.com`) ... domain name


+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf


+ Response 200 (application/json; charset=utf-8)

        {
            "results": {
              "verified": true,
              "cname_status": "valid",
              "compliance_status": "valid"
            }
        }

+ Response 404 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1600",
                  "message": "resource not found",
                  "description": "Resource not found: example.domain.com"
                }
              ]
            }
