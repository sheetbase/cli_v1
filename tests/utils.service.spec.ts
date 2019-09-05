import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { isUrl, parseValue } from '../src/services/utils';

describe('(Utils) Utils service', () => {

  it('#isUrl', () => {
    const result1 = isUrl('xxx');
    const result2 = isUrl('http://xxx.xxx');
    const result3 = isUrl('https://xxx.xxx');
    expect(result1).equal(false);
    expect(result2).equal(true);
    expect(result3).equal(true);
  });

  it('#parseValue', () => {
    const result1 = parseValue(0);
    const result2 = parseValue(1);
    const result3 = parseValue('2');
    const result4 = parseValue('xxx');
    const result5 = parseValue(true);
    const result6 = parseValue(false);
    const result7 = parseValue('true');
    const result8 = parseValue('FALSE');
    const result9 = parseValue('{"a":1}');
    expect(result1).equal(0);
    expect(result2).equal(1);
    expect(result3).equal(2);
    expect(result4).equal('xxx');
    expect(result5).equal(true);
    expect(result6).equal(false);
    expect(result7).equal(true);
    expect(result8).equal(false);
    expect(result9).eql({ a: 1 });
  });

});