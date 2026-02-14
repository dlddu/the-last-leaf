/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R = void> {
      // Document presence
      toBeInTheDocument(): R
      toBeEmptyDOMElement(): R
      toBeVisible(): R
      toBeInvalid(): R
      toBeValid(): R
      toBeRequired(): R
      toBeDisabled(): R
      toBeEnabled(): R

      // Text content
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveAccessibleDescription(description?: string | RegExp): R

      // Attributes
      toHaveAttribute(attr: string, value?: unknown): R
      toHaveClass(...classNames: string[]): R
      toHaveStyle(css: string | Record<string, unknown>): R

      // Form elements
      toHaveValue(value?: string | string[] | number | null): R
      toHaveDisplayValue(value?: string | RegExp | Array<string | RegExp>): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveFormValues(expectedValues: Record<string, unknown>): R

      // Focus
      toHaveFocus(): R

      // Accessibility
      toHaveAccessibleErrorMessage(message?: string | RegExp): R
      toHaveDescription(description?: string | RegExp): R
      toHaveErrorMessage(message?: string | RegExp): R
    }
  }
}
