title: Sparkpost Labs
description: Documentation for the capabilities of SparkPost Labs.

# Group Sparkpost Labs


## Key Features

* Substitutions applied in top-level headers, text/plain, and text/html parts of REST API injected messages (SMTP message substitutions currently not supported)
* Key/value substitutions using substitution data provided in an arbitrary JSON object format
* Conditional statements such as if, then, else, elseif
* Looping over JSON arrays using each
* Execution of built-in macros
* Support for default values provided as a backup for substitution data that does not exist
* Automatic HTML escaping of substitution values appearing in HTML parts of content
* Automatic encoding of UTF-8 substitution values appearing in email headers

