import { describe, expect, test } from 'vitest'

import { buildFullPath, getPathSegment } from '@src/utils/path'

describe('path utilities', () => {
  describe('buildFullPath', () => {
    test('builds path without trailing slash', () => {
      expect(buildFullPath('/base', 'sub')).toBe('/base/sub')
    })

    test('removes trailing slash from base', () => {
      expect(buildFullPath('/base/', 'sub')).toBe('/base/sub')
    })

    test('removes leading slash from subPath', () => {
      expect(buildFullPath('/base', '/sub')).toBe('/base/sub')
    })

    test('handles both base trailing slash and subPath leading slash', () => {
      expect(buildFullPath('/base/', '/sub')).toBe('/base/sub')
    })

    test('returns only normalized base when subPath is undefined', () => {
      expect(buildFullPath('/base')).toBe('/base')
      expect(buildFullPath('/base/')).toBe('/base')
    })

    test('handles empty subPath', () => {
      expect(buildFullPath('/base', '')).toBe('/base')
    })
  })

  describe('getPathSegment', () => {
    test('extracts segment when pathname starts with base', () => {
      expect(getPathSegment('/base/segment', '/base')).toBe('segment')
    })

    test('adds trailing slash to base for matching', () => {
      expect(getPathSegment('/base/segment', '/base')).toBe('segment')
      expect(getPathSegment('/base/segment', '/base/')).toBe('segment')
    })

    test('returns pathname unchanged when it does not start with base', () => {
      expect(getPathSegment('/other/path', '/base')).toBe('other/path')
    })

    test('removes leading and trailing slashes from result', () => {
      expect(getPathSegment('/base//segment/', '/base')).toBe('segment')
    })

    test('handles multiple slashes', () => {
      expect(getPathSegment('///base/segment///', '/base')).toBe('base/segment')
    })
  })
})
