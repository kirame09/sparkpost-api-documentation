title: SMTP API
description: Use the X-MSYS-API header to customize options for messages sent via SMTP.

# Group SMTP API
<a name="smtp-api"></a>

You can use the `X-MSYS-API` header in your SMTP messages to specify a campaign id, metadata, tags, IP pool, CC, BCC, and archive recipient lists and disable open and/or click tracking. See [SMTP Relay Endpoints](index.html#header-smtp-relay-endpoints) for the SMTP client configuration needed to use SparkPost as an SMTP relay.

<div class="alert alert-info"><strong>Note</strong>: To use this option you should be familiar with how to encode options as JSON strings, as the value of the header field is a JSON object that specifies the relevant options</div>

```
X-MSYS-API: {
  "campaign_id": "my_campaign",
  "metadata" : {
    "has_pets": true,
    "pet_name": "Spot"
  },
  "cc": [
    { "email": "cc_recip_1@gmail.com", "name": "CC 1" },
    { "email": "cc_recip_2@gmail.com", "name": "CC 2" }
  ],
  "bcc": [
    { "email": "bcc_recip_1@gmail.com", "name": "BCC 1" }
    { "email": "bcc_recip_2@gmail.com", "name": "BCC 2" }
  ],
  "archive": [
    { "email": "archive_recip_1@gmail.com", "name": "Archive 1" }
    { "email": "archive_recip_2@gmail.com", "name": "Archive 2" }
  ],
  "tags": [
    "cat",
    "dog"
  ],
  "options" : {
    "open_tracking": false,
    "click_tracking": false,
    "transactional": false,
    "sandbox": false,
    "skip_suppression": false,
    "ip_pool": "sp_shared",
    "inline_css": false
  }
}
```


<div class="alert alert-info"><strong>Note</strong>: Key-value <a href="substitutions-reference.html">substitutions</a> are not supported in SMTP API. Any substitution_data field provided in the X-MSYS-API header will be ignored.</div>

The fields supported in the X-MSYS-API header are as follows:

| Field | Type | Description | Required | Notes |
|-------|------|-------------|----------|-------|
| campaign_id | string | Name of the campaign to associate with the SMTP message | no | Maximum length - 64 bytes (same restriction as the REST API) |
| metadata | JSON object | JSON key value pairs associated with the SMTP message | no | A maximum of 1000 bytes of metadata is available in click/open events. |
| cc | JSON array | Array of recipient addresses that will be included in the "Cc" header | no | A unique message with a unique tracking URL will be generated for each recipient in this list. |
| bcc | JSON array | Array of recipient addresses that will be hidden from all other recipients | no | A unique message with a unique tracking URL will be generated for each recipient in this list. |
| archive | JSON array | Array of recipient addresses that will be hidden from all other recipients | no | A unique message will be generated for each recipient in this list. The archive copy of the message contains tracking URLs identical to the recipient. For a full description, see [What is an archive recipient?](#header-what-is-an-archive-recipient?) section.|
| tags | JSON array | Array of text labels associated with the SMTP message | no | Tags are available in click/open events. Maximum number of tags is 10 per recipient, 100 system wide. |
| options | JSON object | JSON object in which SMTP API options are defined | no | For a full description, see the [Options Attributes](#header-options-attributes). |

## Options Attributes

| Field | Type | Description | Required | Notes |
|-------|------|-------------|----------|-------|
| open_tracking | boolean | Whether open tracking is enabled for this SMTP message | no | [See notes](#header-open-and-click-tracking) for defaults. |
| click_tracking | boolean | Whether click tracking is enabled for this SMTP message | no | [See notes](#header-open-and-click-tracking) for defaults. |
| transactional | boolean | Whether message is [transactional](https://www.sparkpost.com/resources/infographics/email-difference-transactional-vs-commercial-emails/), for unsubscribe and suppression purposes<br/><span class="label label-info"><strong>Note</strong></span> no List-Unsubscribe header is included in transactional messages | no | Defaults to false. |
| sandbox| boolean| Whether to use the sandbox sending domain | no | <span class="label label-primary"><strong>SparkPost</strong></span> The sandbox domain is available for SparkPost customers. Defaults to false. |
| skip_suppression| boolean| Whether to ignore customer suppression rules, for this SMTP message only. | no | <a href="https://www.sparkpost.com/enterprise-email/"><span class="label label-warning"><strong>Enterprise</strong></span></a> Defaults to false. |
| ip_pool | string | The ID of a dedicated IP pool associated with your account.  If this field is not provided, the account's default dedicated IP pool is used (if there are IPs assigned to it).  To explicitly bypass the account's default dedicated IP pool and instead fallback to the shared pool, specify a value of "sp_shared". | no | <span class="label label-primary"><strong>SparkPost</strong></span> For more information on dedicated IPs, see the [Support Center](https://support.sparkpost.com/customer/en/portal/articles/2002977-dedicated-ip-addresses)
| inline_css| boolean| Whether to perform CSS inlining in HTML content<br/><span class="label label-info"><strong>Note</strong></span> only rules in `head > style` elements will be inlined | no | Defaults to false. |

### Open And Click Tracking

<div class="alert alert-info"><strong><a href="https://www.sparkpost.com/enterprise-email/">SparkPost Enterprise customers</a>:</strong> SMTP click and open tracking are <strong>enabled</strong> by default. Please check with your TAM if you are unsure of the setting in your own environment.</div>

<div class="alert alert-info"><strong>SparkPost customers:</strong> SMTP click and open tracking are <strong>disabled</strong> by default.</div>

To enable click and open tracking in SMTP messages, add the X-MSYS-API header as follows:
```
X-MSYS-API: { "options" : { "open_tracking" : true, "click_tracking" : true } }
```

<div class="alert alert-info"><strong>SparkPost customers:</strong> the <tt>open_tracking</tt> and <tt>click_tracking</tt> variables may also be set account-wide in your <a href="https://app.sparkpost.com/account/smtp">SMTP relay account settings</a>.</div>

## The Sandbox Domain

<div class="alert alert-info"><strong>Note</strong>: The Sandbox Domain is available to SparkPost customers only</div>

The sandbox domain `sparkpostbox.com` is available to allow each account to send test messages in advance of configuring a real sending domain. Each SparkPost account has a lifetime allowance of 50 sandbox domain messages. That means one may send up to 50 test messages using `From: something@sparkpostbox.com`. Note that you can set the 'local part' (the part before the @) to any valid email local part.

## Sending Messages with cc, bcc, and archive Recipients

When submitting an email via SMTP that includes the X-MSYS-API header, you may specify a JSON array for cc, bcc, and archive lists.  For each address in each of these arrays, a message will be generated. Messages will be generated with the following headers:
* It is the responsibility of the user to include their own `To` header in the body of the message.
* All messages will display the `Cc` header and the value of that header will include all addresses listed in the `cc` array.
* The `bcc` recipients will each receive a message with the `To` and `Cc` headers described above and, additionally, will see a `Bcc` header with ONLY their own recipient address as the value of the header.
* The `archive` recipients will each receive a message with the `To` and `Cc` headers described above however, they will not have a `Bcc` header.

The following are key points about reporting and tracking for cc, bcc, and archive messages:
* Each recipient (To, Cc, Bcc, and archive) is counted as a targeted message.
* A `rcpt_type` field is available during events through the Webhooks, which designates if the message was a Cc, Bcc, or archive copy.
* A `transmission_id` field is available during events through the Webhooks, which can be used to correlate the Cc, Bcc, and archive versions of the messages to one another.

<div class="alert alert-info"><strong>Note</strong>: each recipient will only receive a single instance of each message, even if they appear on more than one of the CC, BCC or archive recipient lists.</div>

#### What is an archive recipient?

Recipients in the `archive` list will receive an exact replica of the message that was sent to the RCPT TO address. In particular, any encoded links intended for the `RCPT TO` recipient will be identical in the archive messages.  In contrast, recipients in the `bcc` list will have links encoded specific to their address. There will be some small differences between the `RCPT TO` message and the `archive` message, for example in headers that contain the delivery address like `X-MSFBL` and `List-Unsubscribe`.

For example:

```
X-MSYS-API: {
   "cc" : [ "cc_email1@corp.com", "cc_email2@corp.com" ],
   "bcc" : [ "bcc_email1@corp.com", "bcc_email2@corp.com" ],
   "archive" : [ "archive_email@corp.com" ],
   "options" : {"open_tracking" : false, "click_tracking" : true},
}
```
You may not specify more than a total of 1000 total recipients in those 3 lists.

You may also specify name and email keys in the `cc` and `bcc` JSON arrays in order to produce a friendly `Cc` or `Bcc` header. For example:

```
X-MSYS-API: {
   "cc" : [
    {
    "email" : "cc_recip_1@gmail.com",
    "name" : "CC 1"
    },
    {
    "email" : "cc_recip_2@gmail.com",
    "name" : "CC 2"
    }
  ]

  "bcc" : [
    {
    "email" : "bcc_recip_1@gmail.com",
    "name" : "BCC 1"
    }
  ]
}
```

## Comments on Header Length

SMTP defines a maximum line length of 1000 characters (including CRLF).  If the value of the `X-MSYS-API` JSON string is
longer than 998 characters, it will be folded across multiple lines before the message is injected.  An example
of a folded header that will not have issues due to extra spaces:

```
X-MSYS-API: {"options" : {"open_tracking" : false, "click_tracking" : true},
   "metadata" : {"has_pets" : true, "pet_name": "Spot" }, "tags" : ["cat",
   "dog"], "campaign_id" : "my_campaign"}
```

<div class="alert alert-warning">When the <tt>X-MSYS-API</tt> header is unfolded on the receiving system, as per <a href="http://www.rfcreader.com/#rfc2822_line324">RFC2822</a>, a single space will be added between each line of the header.</div>

The following example shows how the JSON object in an `X-MSYS-API` header can be corrupted as a result of folding and unfolding:

```
X-MSYS-API: {"options" : {"open_tracking" : false }, "campaign_id" : "my_awes
   ome_campaign" }
```

Will be unfolded as

```
X-MSYS-API: {"options" : {"open_tracking" : false }, "campaign_id" : "my_awes ome_campaign" }
```

Note the space that was introduced in the `my_awes ome_campaign` string.

## Non-ASCII characters

If non-ASCII characters are present in the `campaign_id`, `tags`, or `metadata` fields, they must be escaped using the `\u` Unicode code point format (`\n` becomes `\u000A`), or <a href="http://www.rfcreader.com/#rfc2047">rfc2047</a>-encoded.

## Invalid JSON

If the `X-MSYS-API` header contains invalid JSON, the SMTP message will be rejected with one of the following codes:

| Code | Example |
|------|---------|
| 550  | `5.6.0 X-MSYS-API 'metadata' must be of type 'json object'`<br/>`5.6.0 smtpapi_campaign_id context is limited to 64 bytes` |
| 421  | `4.3.3 [internal] smtpapi unable to generate unique transmission id` |
