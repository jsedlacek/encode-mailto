var assert = require("assert");
var mailto = require('..');

describe('mailto', function() {
  it('should encode special chars', function() {
    assert.equal(mailto('?'), 'mailto:%3F');
  });
  it('should not encode @ sign', function() {
    assert.equal(mailto('jakub@example.com'), 'mailto:jakub@example.com');
  });
  it('should escape params', function() {
    assert.equal(mailto('jakub@example.com', {subject: '@#$%^&*'}), 'mailto:jakub@example.com?subject=@%23%24%25%5E%26*');
  });
});
