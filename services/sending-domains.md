# Group Sending Domains
<a name="sending-domains-api"></a>

A sending domain is a domain that is used to indicate who an email is from via the "From:" header. Using a custom sending domain enables you to control what recipients see as the From value in their email clients. DNS records can be configured for a sending domain, which allows recipient mail servers to authenticate your messages. The Sending Domains API provides the means to create, list, retrieve, update, and verify a custom sending domain.

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

## Sending Domain Attributes

| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|domain    | string | Name of the sending domain | yes |The domain name will be used as the "From:" header address in the email.|
|tracking_domain | string | Associated tracking domain | no | example: "click.example1.com". **Note**: tracking domain and sending domain must belong to the same subaccount to be linked together.|
|status | JSON object | JSON object containing status details, including whether this domain's ownership has been verified  | no | Read only. For a full description, see the Status Attributes.|
|dkim | JSON object | JSON object in which DKIM key configuration is defined | no | For a full description, see the DKIM Attributes.|
|generate_dkim | boolean | Whether to generate a DKIM keypair on creation | no | defaults to true |
|dkim_key_length | number | Size, in bits, of the DKIM private key to be generated.  | no | This option only applies if generate_dkim is 'true'. Private key size defaults to 1024. Note that public keys for private keys longer than 1024 bits will be longer that 255 characters.  Because of this, the public key TXT record in DNS will need to contain multiple strings, see [RFC 7208, section 3.3](https://tools.ietf.org/html/rfc7208#section-3.3) for an example of how the SPF spec addresses this|
|shared_with_subaccounts | boolean | Setting to true allows this domain to be used by subaccounts | no | Defaults to false, only available to domains belonging to a master account.|

### DKIM Attributes

DKIM uses a pair of public and private keys to authenticate your emails. The DKIM key configuration is described in a JSON object with the following fields:

| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|signing_domain| string | Signing Domain Identifier (SDID) | no | This will be used in the d= field of the DKIM Signature. If signing_domain is not specified, or is set to the empty string (""), then the Sending Domain will be used as the signing domain. ( **Note**: signing_domain is only available in SparkPost Elite. In SparkPost.com, the Sending Domain is always used as the signing domain. ) |
|private | string | DKIM private key | yes | The private key will be used to create the DKIM Signature.|
|public | string |DKIM public key  | yes | The public key will be retrieved from DNS of the sending domain.|
|selector | string |DomainKey selector | yes | The DomainKey selector will be used to indicate the DKIM public key location.|
|headers | string| Header fields to be included in the DKIM signature |no | **This field is currently ignored.** |

### Status Attributes

Detailed status for this sending domain is described in a JSON object with the following fields:

| Field         | Type     | Description                           | Default   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|ownership_verified | boolean | Whether domain ownership has been verified |false |Read only. This field will return "true" if any of dkim_status, spf_status, abuse_at_status, or postmaster_at_status are "true".|
|dkim_status | string | Verification status of DKIM configuration |unverified|Read only. Valid values are "unverified", "pending", "invalid" or "valid".|
|spf_status | string | Verification status of SPF configuration |unverified |Read only. Valid values are "unverified", "pending", "invalid" or "valid".|
|abuse_at_status | string | Verification status of abuse@ mailbox |unverified |Read only. Valid values are "unverified", "pending", "invalid" or "valid".|
|postmaster_at_status | string | Verification status of postmaster@ mailbox |unverified |Read only. Valid values are "unverified", "pending", "invalid" or "valid".|
|compliance_status | string | Compliance status | | Valid values are "pending", "valid", or "blocked".|

### Verify Attributes

These are the valid request options for verifying a Sending Domain:

| Field         | Type     | Description                           | Required  | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|dkim_verify | boolean | Request verification of DKIM record | no | |
|spf_verify | boolean | Request verification of SPF record | no | |
|postmaster_at_verify | boolean | Request an email with a verification link to be sent to the sending domain's postmaster@ mailbox. | no | SparkPost.com only |
|abuse_at_verify | boolean | Request an email with a verification link to be sent to the sending domain's abuse@ mailbox. | no | SparkPost.com only |
|postmaster_at_token | string | A token retrieved from the verification link contained in the postmaster@ verification email. | no | SparkPost.com only |
|abuse_at_token | string | A token retrieved from the verification link contained in the abuse@ verification email. | no | SparkPost.com only |

### DNS Attributes

| Field         | Type     | Description                           |
|------------------------|:-:       |---------------------------------------|
|dkim_record | string | DNS DKIM record for the registered Sending Domain |
|spf_record | string | DNS SPF record for the registered Sending Domain |
|dkim_error | string | Error message describing reason for DKIM verification failure |
|spf_error | string | Error message describing reason for SPF verification failure |

## Create [/sending-domains]

### Create a Sending Domain [POST]

Create a sending domain by providing a **sending domain object** as the POST request body.

To use a DKIM Signing Domain Identifier different to the Sending Domain, set the dkim.signing_domain field. ( **Note**: dkim.signing_domain is only available in SparkPost Elite. )

**Note**: For some SparkPost Elite customers, Sending Domains will be set to verified automatically when they are created, and can be used to send messages immediately. For these customers, there is no need to use the "verify" endpoint to verify Sending Domains. To find out if this applies in your SparkPost Elite environment, please contact support <support@sparkpostelite.com>, or contact your TAM.

+ Request Create New Sending Domain with Auto-Generated DKIM Keypair (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

           {
               "domain": "example1.com"
           }

+ Response 200 (application/json)

        {
          "results": {
            "message": "Successfully Created domain.",
            "domain": "example1.com"
            "dkim": {
              "public": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
              "selector": "scph0316",
              "signing_domain": "",
              "headers": "from:to:subject:date"
            }
          }
        }

+ Request Create Sending Domain without DKIM Keypair

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

           {
               "domain": "example1.com",
               "generate_dkim": false
           }

+ Response 200 (application/json)

        {
          "results": {
            "message": "Successfully Created domain.",
            "domain": "example1.com"
          }
        }

+ Request Provide Pre-Generated DKIM Keypair (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

          {
              "domain": "example1.com",
              "tracking_domain": "click.example1.com",
              "dkim": {  "private": "MIICXgIBAAKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQABAoGBAITb3BCRPBi5lGhHdn+1RgC7cjUQEbSb4eFHm+ULRwQ0UIPWHwiVWtptZ09usHq989fKp1g/PfcNzm8c78uTS6gCxfECweFCRK6EdO6cCCr1cfWvmBdSjzYhODUdQeyWZi2ozqd0FhGWoV4VHseh4iLj36DzleTLtOZj3FhAo1WJAkEA68T+KkGeDyWwvttYtuSiQCCTrXYAWTQnkIUxduCp7Ap6tVeIDn3TaXTj74UbEgaNgLhjG4bX//fdeDW6PaK9YwJBAM6xJmwHLPMgwNVjiz3u/6fhY3kaZTWcxtMkXCjh1QE82KzDwqyrCg7EFjTtFysSHCAZxXZMcivGl4TZLHnydJUCQQCx16+M+mAatuiCnvxlQUMuMiSTNK6Amzm45u9v53nlZeY3weYMYFdHdfe1pebMiwrT7MI9clKebz6svYJVmdtXAkApDAc8VuR3WB7TgdRKNWdyGJGfoD1PO1ZE4iinOcoKV+IT1UCY99Kkgg6C7j62n/8T5OpRBvd5eBPpHxP1F9BNAkEA5Nf2VO9lcTetksHdIeKK+F7sio6UZn0Rv7iUo3ALrN1D1cGfWIh2dj3ko1iSreyNVSwGW0ePP27qDmU+u6/Y1g==",
                  "public": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
                  "selector": "scph0316",
                  "headers": "from:to:subject:date"
              }
          }

+ Response 200 (application/json)

        {
          "results": {
            "message": "Successfully Created domain.",
            "domain": "example1.com"
            "dkim": {
              "public": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
              "selector": "scph0316",
              "signing_domain": "",
              "headers": "from:to:subject:date"
            }
          }
        }

+ Response 400 (application/json)

           {
             "errors": [
               {
                 "message": "invalid params",
                 "description": "Tracking domain 'click.example1.com' is not a registered tracking domain",
                 "code": "1200"
               }
             ]
           }

+ Response 422 (application/json)

           {
             "errors": [
               {
                 "message": "invalid data format/type",
                 "description": "Error validating domain name syntax for domain: '(domain)'",
                 "code": "1300"
               }
             ]
           }

### List all Sending Domains [GET]

List an overview of all sending domains in the system.

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

        {
            "results": [
                {
                    "domain": "example1.com",
                    "tracking_domain": "click.example1.com",
                    "status": {
                        "ownership_verified": true,
                        "spf_status": "valid",
                        "abuse_at_status": "valid",
                        "dkim_status": "valid",
                        "compliance_status": "valid",
                        "postmaster_at_status": "valid"
                    },
                    "shared_with_subaccounts": false
                },
                {
                    "domain": "example2.com",
                    "status": {
                        "ownership_verified": false,
                        "spf_status": "pending",
                        "abuse_at_status": "pending",
                        "dkim_status": "pending",
                        "compliance_status": "pending",
                        "postmaster_at_status": "pending"
                    },
                    "shared_with_subaccounts": false
                }
            ]
        }

## Retrieve, Update, and Delete [/sending-domains/{domain}]

### Retrieve a Sending Domain [GET]

Retrieve a sending domain by specifying its domain name in the URI path.  The response includes details about its DKIM key configuration.

+ Parameters
  + domain (required, string, `example1.com`) ... Name of the domain

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

        {
            "results": {
                "tracking_domain": "click.example1.com",
                "status": {
                    "ownership_verified": false,
                    "spf_status": "pending",
                    "abuse_at_status": "pending",
                    "dkim_status": "pending",
                    "compliance_status": "pending",
                    "postmaster_at_status": "pending"
                },
                "dkim": {
                    "headers": "from:to:subject:date",
                    "public": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
                    "selector": "hello_selector"
                },
                "shared_with_subaccounts": false
            }
        }

### Update a Sending Domain [PUT]

Update the attributes of an existing sending domain by specifying its domain name in the URI path and use a **sending domain object** as the PUT request body.

If a tracking domain is specified, it will replace any currently specified tracking domain.  If the supplied tracking domain is a blank string, it will clear any currently specified tracking domain. Note that if a tracking domain is not specified, any currently specified tracking domain will remain intact.

If a dkim object is provided in the update request, it must contain all relevant fields whether they are being changed or not.  The new dkim object will completely overwrite the existing one.

To remove the DKIM Signing Domain Identifier for a Sending Domain, use the empty string for the value of the dkim.signing_domain field. ( **Note**: dkim.signing_domain is only available in SparkPost Elite. )

+ Parameters
    + domain (required, string, `example1.com`) ... Name of the domain

+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

           {
               "tracking_domain": "click.example1.com",
               "dkim": {  "private": "MIICXgIBAAKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQABAoGBAITb3BCRPBi5lGhHdn+1RgC7cjUQEbSb4eFHm+ULRwQ0UIPWHwiVWtptZ09usHq989fKp1g/PfcNzm8c78uTS6gCxfECweFCRK6EdO6cCCr1cfWvmBdSjzYhODUdQeyWZi2ozqd0FhGWoV4VHseh4iLj36DzleTLtOZj3FhAo1WJAkEA68T+KkGeDyWwvttYtuSiQCCTrXYAWTQnkIUxduCp7Ap6tVeIDn3TaXTj74UbEgaNgLhjG4bX//fdeDW6PaK9YwJBAM6xJmwHLPMgwNVjiz3u/6fhY3kaZTWcxtMkXCjh1QE82KzDwqyrCg7EFjTtFysSHCAZxXZMcivGl4TZLHnydJUCQQCx16+M+mAatuiCnvxlQUMuMiSTNK6Amzm45u9v53nlZeY3weYMYFdHdfe1pebMiwrT7MI9clKebz6svYJVmdtXAkApDAc8VuR3WB7TgdRKNWdyGJGfoD1PO1ZE4iinOcoKV+IT1UCY99Kkgg6C7j62n/8T5OpRBvd5eBPpHxP1F9BNAkEA5Nf2VO9lcTetksHdIeKK+F7sio6UZn0Rv7iUo3ALrN1D1cGfWIh/Y1g==",
                   "public": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
                   "selector": "hello_selector",
                   "headers": "from:to:subject:date"
               }
           }

+ Response 200 (application/json)

        {
            "results": {
                "message": "Successfully Updated Domain.",
                "domain": "example1.com"
            }
        }

+ Response 400 (application/json)

           {
             "errors": [
               {
                 "message": "invalid params",
                 "description": "Tracking domain '(domain)' is not a registered tracking domain",
                 "code": "1200"
               }
             ]
           }

+ Response 422 (application/json)

           {
             "errors": [
               {
                 "message": "invalid data format/type",
                 "description": "Error validating domain name syntax for domain: '(domain)'",
                 "code": "1300"
               }
             ]
           }

### Delete a Sending Domain [DELETE]

Delete an existing sending domain.

**Warning:** Before deleting a sending domain please ensure you are no longer using it. After deleting a sending domain, any new transmissions that use it will result in a rejection. This includes any transmissions that are in progress, scheduled for the future, or use a stored template referencing the sending domain.

+ Parameters
  + domain (required, string, `example1.com`) ... Name of the domain

+ Request

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

+ Response 204

+ Response 404 (application/json)

  + Body

            {
              "errors": [
                {
                  "code": "1600",
                  "message": "resource not found",
                  "description": "Domain 'wrong.domain' does not exist"
                }
              ]
            }


## Verify [/sending-domains/{domain}/verify]

### Verify a Sending Domain [POST]

The verify resource operates differently depending on the provided request fields:
  * Including the fields "dkim_verify" and/or "spf_verify" in the request initiates a check against the associated DNS record type for the specified sending domain.
  * Including the fields "postmaster_at_verify" and/or "abuse_at_verify" in the request results in an email sent to the specified sending domain's postmaster@ and/or abuse@ mailbox where a verification link can be clicked.
  * Including the fields "postmaster_at_token" and/or "abuse_at_token" in the request initiates a check of the provided token(s) against the stored token(s) for the specified sending domain.

DKIM public key verification requires the following:
  * A valid DKIM record must be in the DNS for the sending domain being verified.
  * The record must use the sending domain's public key in the "p=" tag.
  * If a k= tag is defined, it must be set to "rsa".
  * If an h= tag is defined, it must be set to "sha256".

SPF verification requires the following:
  * A valid SPF record must be in the DNS for the sending domain being verified.
  * The record must contain "v=spf1".
  * The record must contain "include:sparkpostmail.com".
  * The record must use either "~all" or "-all".

The domain's "status" object is returned on success.

+ Parameters
  + domain (required, string, `example1.com`) ... Name of the domain

+ Request Verify DKIM and SPF (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

           {
               "dkim_verify": true,
               "spf_verify": true
           }


+ Response 200 (application/json)

        {
            "results": {
                "ownership_verified": true,
                "spf_status": "valid",
                "dns": {
                    "dkim_record": "k=rsa; h=sha256; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+W6scd3XWwvC/hPRksfDYFi3ztgyS9OSqnnjtNQeDdTSD1DRx/xFar2wjmzxp2+SnJ5pspaF77VZveN3P/HVmXZVghr3asoV9WBx/uW1nDIUxU35L4juXiTwsMAbgMyh3NqIKTNKyMDy4P8vpEhtH1iv/BrwMdBjHDVCycB8WnwIDAQAB",
                    "spf_record": "v=spf1 include:sparkpostmail.com ~all"
                },
                "compliance_status": "pending",
                "dkim_status": "valid",
                "abuse_at_status": "unverified",
                "postmaster_at_status": "unverified"
            }
        }

+ Request Initiate postmaster@ email (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

           {
               "postmaster_at_verify": true
           }

+ Response 200 (application/json)

        {
            "results": {
                "ownership_verified": false,
                "spf_status": "unverified",
                "compliance_status": "valid",
                "dkim_status": "unverified",
                "abuse_at_status": "unverified",
                "postmaster_at_status": "unverified"
            }
        }

+ Request Verify postmaster@ correct token (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

           {
               "postmaster_at_token": "rcayptmrczdnrnqfsxyrzljmtsxvjzxb"
           }

+ Response 200 (application/json)

        {
            "results": {
                "ownership_verified": true,
                "spf_status": "unverified",
                "compliance_status": "valid",
                "dkim_status": "unverified",
                "abuse_at_status": "unverified",
                "postmaster_at_status": "valid"
            }
        }

+ Request Verify abuse@ incorrect token (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

           {
               "abuse_at_token": "AN_INCORRECT_OR_EXPIRED_TOKEN"
           }

+ Response 200 (application/json)

        {
            "results": {
                "ownership_verified": false,
                "spf_status": "unverified",
                "compliance_status": "valid",
                "dkim_status": "unverified",
                "abuse_at_status": "unverified",
                "postmaster_at_status": "unverified"
            }
        }

+ Request Unable to process abuse@ request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
    + Body

           {
               "abuse_at_verify": true
           }

+ Response 400 (application/json)

        {
           "errors": [
              {
                 "message": "Failed to generate message",
                 "description": "Failed to generate verification email",
                 "code": "1901"
              }
           ]
        }
