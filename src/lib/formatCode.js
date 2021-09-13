export const formatCode = async code => {
    const prettier = await import('prettier/standalone')
    const babylonParser = await import('prettier/parser-babel')
  
    return prettier.format(code, {
      parser: 'babel',
      plugins: [babylonParser],
      semi: false,
      singleQuote: true,
    })
  }