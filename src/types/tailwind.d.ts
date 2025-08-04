declare module 'tailwindcss' {
  export interface Config {
    content: string[]
    theme?: {
      extend?: {
        colors?: Record<string, any>
        fontFamily?: Record<string, any>
        spacing?: Record<string, any>
        borderRadius?: Record<string, any>
      }
    }
    plugins?: any[]
  }
}

declare module 'postcss-load-config' {
  export interface Config {
    plugins: Record<string, any>
  }
} 