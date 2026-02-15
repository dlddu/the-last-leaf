import '@testing-library/jest-dom'

// Polyfill for jose library (Node.js globals in jsdom environment)
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder
