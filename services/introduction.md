description: Documentation for sending via SMTP or HTTP with the SparkPost API.

# SparkPost API

SparkPost presents a unified core API to all customers with a few noted exceptions.

* Features not available on SparkPost Enterprise API are marked **Not available on SparkPost Enterprise**
* Features available only to the SparkPost Enterprise API are marked **SparkPost Enterprise API only**.

## API Endpoints

| Endpoint   | Use for |
|------------|---------|
| `https://api.sparkpost.com/api/v1` | SparkPost and SparkPost Premium |
| `https://api.sparkpost.com/api/labs` | SparkPost Labs |
| `https://yourdomain.sparkpostelite.com/api/v1` | SparkPost Enterprise API |
| `https://yourdomain.msyscloud.com/api/v1` | SparkPost Enterprise API (formerly 'SparkPost Elite' - prior to June 2015) |

## API Conventions
* API versioning is handled using a major version number in the URL, e.g. /api/v1/endpoint.
* /something is equivalent to /something/.
* URL paths, URL query parameter names, and JSON field names are case sensitive.
* URL paths use lower case, with dashes separating words.
* Query parameters and JSON fields use lower case, with underscores separating words.
* The HTTP status indicates whether an operation failed or succeeded, with extra information included in the HTTP response body.
* All APIs return standard error code formats.
* Unexpected query parameters are ignored.
* Unexpected JSON fields in the request body are ignored.
* The JSON number type is bounded to a signed 32-bit integer.

## Authentication
* To authenticate with the APIs, specify the "Authorization" header with each request. The value of the Authorization header must be a valid API key or basic auth with the API key as username and an empty password.
* Administrators can [generate an API key](https://app.sparkpost.com/account/credentials). Please take care to record and safeguard your API keys at all times. You cannot retrieve an API key after it has been created.
* For examples of supplying the Authorization header, refer to the cURL example below or any of the individual API request examples.

## API examples
SparkPost Enterprise customers should note to change the API endpoint in all the example calls to their specific environment

## Using Postman

If you use [Postman](https://www.getpostman.com/) you can click the following button to import the SparkPost API as a collection:

[![Run in Postman](https://s3.amazonaws.com/postman-static/run-button.png)](https://www.getpostman.com/run-collection/81ee1dd2790d7952b76a)

**SparkPost Enterprise customers will need to change the endpoint in the URL field for each call**

## Using cURL
If you are using cURL to call the API, you must include the resource URI in quotes when you pass in multiple query parameters separated by an `&`.

For example:

```
curl -v \
-H "Content-Type: application/json" \
-H "Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf" \
-X GET "https://api.sparkpost.com/api/v1/metrics/deliverability/aggregate?campaigns=testjob&from=2014-01-23T14:00&metrics=count_targeted,count_sent,count_accepted&timezone=America%2FNew_York&to=2014-06-23T15:50"
```

or

```
curl -v \
-H "Content-Type: application/json" \
-u <APIKey>: \
-X GET "https://api.sparkpost.com/api/v1/metrics/deliverability/aggregate?campaigns=testjob&from=2014-01-23T14:00&metrics=count_targeted,count_sent,count_accepted&timezone=America%2FNew_York&to=2014-06-23T15:50"
```

## SMTP Relay Endpoints
<a name="smtp-relay-endpoints"></a>

<a name="header-sparkpost-smtp-endpoint"></a>
**SparkPost SMTP Endpoint**

To use SparkPost as an SMTP relay you need to point your SMTP client (or local MTA) to the following endpoint **(See below for SparkPost Enterprise)**:

* Host: smtp.sparkpostmail.com 
* Port: 587 or 2525
* Encryption: STARTTLS
* Authentication: AUTH LOGIN
* User: SMTP_Injection
* Password: Any API key with Send via SMTP permission
* To inject mail to an SMTP relay endpoint on behalf of a subaccount, modify your SMTP injection username to include the subaccount ID.
  * For example, use `SMTP_Injection:X-MSYS-SUBACCOUNT=123` to send as a Subaccount, having an ID of 123.
  * The Master Account's API key is still used as the password when sending on behalf of a Subaccount.
  * When sending on behalf of a Subaccount, the Subaccount's Sending Domain must be used.

**Note**: Port 2525 is provided as an alternate port for cases where port 587 is blocked (such as a Google Compute Engine environment).

<a name="header-sparkpost-enterprise-smtp-endpoint"></a>
**SparkPost Enterprise SMTP Endpoint**

Please contact your Technical Account Manager for details on your SMTP endpoint.

The SMTP relay optionally supports advanced API features using the [SMTP API](smtp-api.html).  To create an API key, login to your SparkPost [Account Credentials](https://app.sparkpost.com/account/credentials) page.

## SMTP Security

SparkPost strongly recommends using TLS with SMTP to protect your message content, recipient information and API keys in transmission. **Disabling TLS will cause all data sent through SparkPost to be sent over the public internet ununcrypted**. This includes API keys and any details such as recipient email addresses and message content.

If TLS is not supported by your application, SparkPost recommends using API keys with _only_ the "Send via SMTP" privilege enabled. It is also good practice to regularly cycle your API keys to limit exposure of keys sent in the clear.

## Rate Limiting
Note: To prevent abuse, our servers enforce request rate limiting, which may trigger responses with HTTP status code 429. SparkPost implements rate limiting on the following API endpoints:

- `/api/v1/message-events`
- `/api/v1/metrics/*`

The limits imposed here are dynamic but as a general rule, polling these endpoints more than once in 2 minutes may encounter rate limiting and a 429 status code.

**Alternatives To Polling:** For some common use cases, the SparkPost API offers more efficient alternatives to polling, especially of the message events endpoint. For instance, A single call to the [metrics deliverability summary](api/metrics.html#metrics-deliverability-metrics-get) endpoint offers a summary of deliveries, bounces, opens, clicks and more for some time period. If your application requires low latency access to each message event, using a [webhook-based](/api/webhooks.html) process will be more efficient than polling message events and will avoid rate limiting.

**Sandbox Domain Limits: sparkpostbox.com:** If you use the sandbox domain (sparkpostbox.com) for testing you are limited to 50 emails for the lifetime of your SparkPost account.

## Errors

If your account has been suspended due to concern about a possible violation of our [Messaging Policy](https://www.sparkpost.com/policies) please contact us at [compliance@sparkpost.com](mailto:compliance@sparkpost.com).

When you make an API call you may receive an error message in response. Either there is something wrong with your request or something went wrong on our end. Errors respond with an error code and JSON that contains a more precise message, description and API code.
### Example Error
```
422 Unprocessable Entity
```
```
{
  "errors": [
    {
      "message": "required field is missing",
      "description": "content object or template_id required",
      "code": "1400"
    }
  ]
}
```

### Error Table
|Code|Status Name           |Description                                                                   |Suggested Action|
|----|----------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
|400 |Bad Request           |There is a problem with your request.                                         |Check your request follows the API documentation and uses correct syntax.                                                                           |
|401 |Unauthorized          |You don't have the needed authorization to make the request.                  |Make sure you are using a valid API key with the necessary permissions for your request.                                                            |
|403 |Forbidden             |The server understood the request but refused to fulfill it.                  |See if your SparkPost plan includes the resource you are requesting and your API key has the necessary premissions.                                 |
|404 |Not Found             |The server couldn't find the requested file.                                  |Change your request URL to match a valid API endpoint.                                                                                              |
|405 |Method Not Allowed    |The resource does not have the specified method. (e.g. PUT on transmissions)  |Change the method to follow the documentation for the resource.                                                                                     |
|409 |Conflict              |A conflict arose from your request. (e.g. user already exists with that email)|Modify the payload to clear the conflict.                                                                                                           |
|415 |Unsupported Media Type|The request is not in a supported format.                                     |Check that your Content-Type header is a supported type and that your request adheres to the documentation.                                         |
|420 |Exceed Sending Limit  |You sent too many requests in a given time period.                            |Check that you are with in the limits of your SparkPost plan. (If you are using the sandbox domain you'll need to add a sending domain to continue.)|
|422 |Unprocessable Entity  |The request was syntactically correct but failed do to semantic errors.       |Make sure that you have all the required fields and that your data is valid.                                                                        |
|500 |Internal Server Error |Something went wrong on our end.                                              |Try the request again later. If the error does not resolve, [contact support](https://support.sparkpost.com/).                                      |
|503 |Service Unavailable   |We are experiencing higher than normal levels of traffic.                     |Try the request again.                                                                                                                              |

