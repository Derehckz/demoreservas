const { toDateStr, toDateStrOrNull, safeParseJson, jsonResponse } = require('../../netlify/functions/_utils');

describe('_utils', () => {
  describe('toDateStr', () => {
    it('devuelve cadena vacía para null/undefined', () => {
      expect(toDateStr(null)).toBe('');
      expect(toDateStr(undefined)).toBe('');
    });
    it('convierte Date a YYYY-MM-DD', () => {
      expect(toDateStr(new Date('2026-02-24T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    it('trunca string a 10 caracteres', () => {
      expect(toDateStr('2026-02-24')).toBe('2026-02-24');
      expect(toDateStr('2026-02-24T10:00:00')).toBe('2026-02-24');
    });
  });

  describe('toDateStrOrNull', () => {
    it('devuelve null para null/undefined', () => {
      expect(toDateStrOrNull(null)).toBeNull();
      expect(toDateStrOrNull(undefined)).toBeNull();
    });
    it('devuelve fecha válida YYYY-MM-DD', () => {
      expect(toDateStrOrNull('2026-02-24')).toBe('2026-02-24');
    });
    it('devuelve null para formato inválido', () => {
      expect(toDateStrOrNull('24-02-2026')).toBeNull();
      expect(toDateStrOrNull('invalid')).toBeNull();
    });
  });

  describe('safeParseJson', () => {
    it('devuelve fallback para null/undefined', () => {
      expect(safeParseJson(null)).toEqual([]);
      expect(safeParseJson(undefined, [])).toEqual([]);
      expect(safeParseJson(null, {})).toEqual({});
    });
    it('devuelve array si ya es array', () => {
      expect(safeParseJson([1, 2])).toEqual([1, 2]);
    });
    it('parsea JSON válido', () => {
      expect(safeParseJson('[1,2,3]')).toEqual([1, 2, 3]);
    });
    it('devuelve fallback para JSON inválido', () => {
      expect(safeParseJson('not json')).toEqual([]);
      expect(safeParseJson('{"a":1}', [])).toEqual([]);
    });
    it('devuelve fallback si el parseado no es array', () => {
      expect(safeParseJson('{"a":1}')).toEqual([]);
    });
  });

  describe('jsonResponse', () => {
    it('devuelve objeto con statusCode, headers y body stringificado', () => {
      const r = jsonResponse(200, { ok: true });
      expect(r.statusCode).toBe(200);
      expect(r.headers['Content-Type']).toBe('application/json');
      expect(JSON.parse(r.body)).toEqual({ ok: true });
    });
  });
});
