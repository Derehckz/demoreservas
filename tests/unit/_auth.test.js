const crypto = require('crypto');
const {
  generateToken,
  verifyToken,
  getTokenTimestamp,
} = require('../../netlify/functions/_auth');

// Mock crypto para probar timingSafeEqual
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    timingSafeEqual: jest.fn((a, b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
      return true;
    }),
  };
});

describe('_auth', () => {
  const SECRET = 'test-secret-123';

  describe('generateToken', () => {
    it('devuelve string con 3 partes separadas por punto', () => {
      const token = generateToken(SECRET);
      const parts = token.split('.');
      expect(parts.length).toBe(3);
      expect(parts[0].length).toBe(32); // 16 bytes hex
      expect(parts[1]).toMatch(/^\d+$/);
      expect(parts[2].length).toBe(64); // sha256 hex
    });

    it('genera tokens diferentes en cada llamada', () => {
      const t1 = generateToken(SECRET);
      const t2 = generateToken(SECRET);
      expect(t1).not.toBe(t2);
    });
  });

  describe('verifyToken', () => {
    it('verifica token válido recién generado', () => {
      const token = generateToken(SECRET);
      expect(verifyToken(token, SECRET)).toBe(true);
    });

    it('rechaza token con secret distinto', () => {
      const token = generateToken(SECRET);
      expect(verifyToken(token, 'otro-secret')).toBe(false);
    });

    it('rechaza token con formato inválido (menos de 3 partes)', () => {
      expect(verifyToken('a.b', SECRET)).toBe(false);
      expect(verifyToken('', SECRET)).toBe(false);
      expect(verifyToken('solo', SECRET)).toBe(false);
    });

    it('rechaza token con timestamp inválido', () => {
      const nonce = crypto.randomBytes(16).toString('hex');
      const payload = `${nonce}.not-a-number`;
      const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
      const token = `${payload}.${sig}`;
      expect(verifyToken(token, SECRET)).toBe(false);
    });

    it('rechaza token expirado (7 días)', () => {
      const nonce = crypto.randomBytes(16).toString('hex');
      const hace8Dias = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const payload = `${nonce}.${hace8Dias}`;
      const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
      const token = `${payload}.${sig}`;
      expect(verifyToken(token, SECRET)).toBe(false);
    });
  });

  describe('getTokenTimestamp', () => {
    it('devuelve timestamp para token válido', () => {
      const token = generateToken(SECRET);
      const ts = getTokenTimestamp(token);
      expect(typeof ts).toBe('number');
      expect(ts).toBeGreaterThan(0);
      expect(Math.abs(ts - Date.now())).toBeLessThan(5000);
    });

    it('devuelve null para token con formato inválido', () => {
      expect(getTokenTimestamp('')).toBeNull();
      expect(getTokenTimestamp('a.b')).toBeNull();
      expect(getTokenTimestamp('a.b.c')).toBeNull();
    });

    it('devuelve null para token con timestamp no numérico', () => {
      expect(getTokenTimestamp('a.xyz.c')).toBeNull();
    });
  });
});
