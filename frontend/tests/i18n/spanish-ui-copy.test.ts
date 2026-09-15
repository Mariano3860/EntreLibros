import { readdirSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

import ts from 'typescript'

import enTranslations from '@src/assets/i18n/locales/en/common.json'
import esTranslations from '@src/assets/i18n/locales/es/common.json'

type Finding = { file: string; line: number; text: string }

const frontendRoot = process.cwd()
// Scope is production route/component code. Comments are absent from the AST;
// mocks, fixtures, locale files, and domain values in shared adapters/content
// are excluded and covered by their translation and rendered-surface tests.
const sourceRoots = ['src/pages', 'src/components'].map((path) =>
  resolve(frontendRoot, path)
)
const uiPropertyNames = new Set([
  'alt',
  'aria-label',
  'aria-description',
  'ariaLabel',
  'defaultValue',
  'label',
  'placeholder',
  'title',
])
const spanishUiMarkers =
  /[áéíóúñ¿¡]|\b(?:aceptar|agregar|ayuda|buscar|búsqueda|cambiar|cancelar|cerrar|comunidad|contraseña|correo|descripción|disponible|editar|eliminar|enviar|escribe|elegí|filtrar|filtros|guardar|historia|interés|intereses|lectura|mapa|mensajes|nombre|perfil|publicar|reportar|sugerencias|ubicación|volver)\b/i

const isSpanishUiCopy = (value: string): boolean => {
  const contactAddress = value.trim().replace(/^✉\s*/, '')
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(contactAddress)) return false
  return spanishUiMarkers.test(value)
}

const hasLocaleKey = (resource: unknown, key: string): boolean => {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[part]
  }, resource)
  return typeof value === 'string'
}

const readSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return readSourceFiles(path)
    return /\.tsx?$/.test(entry.name) ? [path] : []
  })

const propertyName = (name: ts.PropertyName): string | undefined => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return undefined
}

const literalString = (node: ts.Expression | undefined): string | undefined => {
  if (!node) return undefined
  if (ts.isStringLiteral(node)) return node.text
  if (
    ts.isJsxExpression(node) &&
    node.expression &&
    ts.isStringLiteral(node.expression)
  ) {
    return node.expression.text
  }
  return undefined
}

const hasLocalizedTranslationKey = (node: ts.PropertyAssignment): boolean => {
  if (propertyName(node.name) !== 'defaultValue') return false
  const options = node.parent
  const call = options.parent
  if (!ts.isObjectLiteralExpression(options) || !ts.isCallExpression(call)) {
    return false
  }
  const callee = call.expression
  if (
    !(
      (ts.isIdentifier(callee) && callee.text === 't') ||
      (ts.isPropertyAccessExpression(callee) && callee.name.text === 't')
    )
  ) {
    return false
  }

  const translationKey = call.arguments[0]
  if (
    !translationKey ||
    (!ts.isStringLiteral(translationKey) &&
      !ts.isNoSubstitutionTemplateLiteral(translationKey))
  ) {
    return false
  }

  return (
    hasLocaleKey(enTranslations, translationKey.text) &&
    hasLocaleKey(esTranslations, translationKey.text)
  )
}

const scanSource = (source: string, fileName: string): Finding[] => {
  const scriptKind = fileName.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  )
  const findings: Finding[] = []

  const addFinding = (node: ts.Node, value: string) => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile)
    )
    findings.push({
      file: relative(frontendRoot, fileName).replaceAll('\\', '/'),
      line: line + 1,
      text: value.trim(),
    })
  }

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && isSpanishUiCopy(node.text.trim())) {
      addFinding(node, node.text)
    }

    if (
      ts.isJsxAttribute(node) &&
      uiPropertyNames.has(node.name.getText(sourceFile)) &&
      isSpanishUiCopy(literalString(node.initializer) ?? '')
    ) {
      addFinding(node, literalString(node.initializer) ?? '')
    }

    if (
      ts.isPropertyAssignment(node) &&
      uiPropertyNames.has(propertyName(node.name) ?? '') &&
      ts.isStringLiteral(node.initializer) &&
      isSpanishUiCopy(node.initializer.text) &&
      !hasLocalizedTranslationKey(node)
    ) {
      addFinding(node, node.initializer.text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return findings
}

const scanProductUi = (): Finding[] =>
  sourceRoots.flatMap((root) =>
    readSourceFiles(root).flatMap((fileName) =>
      scanSource(readFileSync(fileName, 'utf8'), fileName)
    )
  )

describe('Spanish UI literal guard', () => {
  test('finds rendered Spanish copy and ignores comments and test fixtures', () => {
    const findings = scanSource(
      `// Guardar en el perfil no es una vista.\nconst Example = () => <button aria-label="Cerrar">Guardar</button>`,
      resolve(frontendRoot, 'src/pages/example.tsx')
    )

    expect(findings.map(({ text }) => text)).toEqual(['Cerrar', 'Guardar'])
  })

  test('allows translated fallback values only when both locales define the key', () => {
    const findings = scanSource(
      `const Example = () => t('bookDetail.close', { defaultValue: 'Cerrar' })\nconst Missing = () => t('missing.action', { defaultValue: 'Guardar' })`,
      resolve(frontendRoot, 'src/pages/example.tsx')
    )

    expect(findings.map(({ text }) => text)).toEqual(['Guardar'])
  })

  test('does not flag the operational contact email as interface copy', () => {
    const findings = scanSource(
      '<a href="mailto:ayuda@entrelibros.com">✉ ayuda@entrelibros.com</a>',
      resolve(frontendRoot, 'src/pages/example.tsx')
    )

    expect(findings).toEqual([])
  })

  test('keeps route and component source free of Spanish UI literals', () => {
    expect(scanProductUi()).toEqual([])
  })
})
