import { splitPostalAddress } from 'app/utility/postalAddress';

describe('postal suffix display without truncating address data', () => {
  test.each([
    'SYNTHETIC MOBILE QA FIXTURE - RESERVED FOR 20261019',
    'BLOCK 1234567',
    'UNIT A123456',
  ])('preserves a longer or attached numeric token: %s', (address) => {
    expect(splitPostalAddress(address)).toEqual({ address, postalCode: '' });
  });

  test.each(['123456', 'S123456', 'S 123456', 'S(123456)'])(
    'recognizes a separate complete postal suffix: %s',
    (suffix) => {
      expect(splitPostalAddress(`10 TEST ROAD ${suffix}`)).toEqual({
        address: '10 TEST ROAD',
        postalCode: '123456',
      });
    },
  );

  it('preserves the address when the API supplies a separate postal field', () => {
    expect(splitPostalAddress('10 TEST ROAD 20261019', '654321')).toEqual({
      address: '10 TEST ROAD 20261019',
      postalCode: '654321',
    });
  });
});
