// Copyright 2006-2008 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

"use strict";

// This file contains support for URI manipulations written in
// JavaScript.


// Does the char code correspond to an alpha-numeric char.
function isAlphaNumeric(cc) {
  // a - z
  if (97 <= cc && cc <= 122) return true;
  // A - Z
  if (65 <= cc && cc <= 90) return true;
  // 0 - 9
  if (48 <= cc && cc <= 57) return true;

  return false;
}

//Lazily initialized.
var hexCharCodeArray = 0;

function URIAddEncodedOctetToBuffer(octet, result, index) {
  result[index++] = 37; // Char code of '%'.
  result[index++] = hexCharCodeArray[octet >> 4];
  result[index++] = hexCharCodeArray[octet & 0x0F];
  return index;
}

function URIEncodeOctets(octets, result, index) {
  if (hexCharCodeArray === 0) {
    hexCharCodeArray = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
                        65, 66, 67, 68, 69, 70];
  }
  index = URIAddEncodedOctetToBuffer(octets[0], result, index);
  if (octets[1]) index = URIAddEncodedOctetToBuffer(octets[1], result, index);
  if (octets[2]) index = URIAddEncodedOctetToBuffer(octets[2], result, index);
  if (octets[3]) index = URIAddEncodedOctetToBuffer(octets[3], result, index);
  return index;
}

function URIEncodeSingle(cc, result, index) {
  var x = (cc >> 12) & 0xF;
  var y = (cc >> 6) & 63;
  var z = cc & 63;
  var octets = new Array(3);
  if (cc <= 0x007F) {
    octets[0] = cc;
  } else if (cc <= 0x07FF) {
    octets[0] = y + 192;
    octets[1] = z + 128;
  } else {
    octets[0] = x + 224;
    octets[1] = y + 128;
    octets[2] = z + 128;
  }
  return URIEncodeOctets(octets, result, index);
}

function URIEncodePair(cc1 , cc2, result, index) {
  var u = ((cc1 >> 6) & 0xF) + 1;
  var w = (cc1 >> 2) & 0xF;
  var x = cc1 & 3;
  var y = (cc2 >> 6) & 0xF;
  var z = cc2 & 63;
  var octets = new $Array(4);
  octets[0] = (u >> 2) + 240;
  octets[1] = (((u & 3) << 4) | w) + 128;
  octets[2] = ((x << 4) | y) + 128;
  octets[3] = z + 128;
  return URIEncodeOctets(octets, result, index);
}

// ECMA-262, section 15.1.3
function Encode(uri, unescape) {
  var uriLength = uri.length;
  var array = new Array(uriLength);
  var index = 0;
  for (var k = 0; k < uriLength; k++) {
    var cc1 = uri.charCodeAt(k);
    if (unescape(cc1)) {
      array[index++] = cc1;
    } else {
      if (cc1 >= 0xDC00 && cc1 <= 0xDFFF) throw new Error("URI malformed");
      if (cc1 < 0xD800 || cc1 > 0xDBFF) {
        index = URIEncodeSingle(cc1, array, index);
      } else {
        k++;
        if (k == uriLength) throw new Error("URI malformed");
        var cc2 = uri.charCodeAt(k);
        if (cc2 < 0xDC00 || cc2 > 0xDFFF) throw new $URIError("URI malformed");
        index = URIEncodePair(cc1, cc2, array, index);
      }
    }
  }

  var result = '';
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

function EncodeMailtoComponent(string) {
  // Same as encodeURIComponent, but does not escape @ sign
  var unescapePredicate = function(cc) {
    if (isAlphaNumeric(cc)) return true;
    // !
    if (cc == 33) return true;
    // '()*
    if (39 <= cc && cc <= 42) return true;
    // -.
    if (45 <= cc && cc <= 46) return true;
    // _
    if (cc == 95) return true;
    // ~
    if (cc == 126) return true;
    // @
    if (cc == 64) return true;

    return false;
  };
  return Encode(string, unescapePredicate);
}

function mailto(to, params) {
  var keys = params ? Object.keys(params) : [];
  var qs = keys.length === 0 ?
    '' :
    '?' + keys.map(function(key) {
      return EncodeMailtoComponent(key) + '=' + EncodeMailtoComponent(params[key]);
    }).join('&');
  return 'mailto:' + EncodeMailtoComponent(to) + qs;
}

module.exports = mailto;
