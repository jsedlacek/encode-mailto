# encode-mailto
Encode mailto links

## Usage

```javascript
var mailto = require('mailto');

// Email
mailto('jakub@example.com'); // mailto:jakub@example.com

// Subject and other params
mailto('jakub@example.com', {subject: 'aaa'}); // mailto:jakub@example.com?subject=aaa

// Escaping
mailto('???@example.com', {subject: '&&&'}); // mailto:%3F%3F%3F@example.com?subject=%26%26%26

```
